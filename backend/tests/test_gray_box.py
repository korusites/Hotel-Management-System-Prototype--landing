"""
Testes de caixa cinza.

Diferença em relação à caixa branca (testes unitários com mocks, em
`backend/app`) e à caixa preta (fluxo pela UI): aqui conhecemos a
arquitetura interna — dois serviços separados, um rate limiter com limiar
configurado, uma transição de status que só ocorre na leitura — mas cada
asserção é feita batendo na API/serviço real, sem importar nem mockar
nada de dentro do código de produção.

Pré-requisitos para rodar:
    docker compose up -d --build
    docker compose exec api alembic upgrade head
    docker compose exec api python seed.py   # se o banco ainda estiver vazio

Rodando os testes (da raiz do projeto ou de backend/):
    pip install -r backend/requirements-dev.txt
    pytest backend/tests -v

CG-02 e CG-05 manipulam o ambiente diretamente (para o container do
sistema financeiro; escrevem no Postgres) — por isso não rodam dentro de
um container, e sim na máquina host, onde o `docker compose` e a porta
5433 do Postgres já estão expostos.
"""

import asyncio
import subprocess
import time
import uuid
from datetime import date
from pathlib import Path

import asyncpg
import httpx
import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]


def _unique_email(prefix: str) -> str:
    return f"{prefix}.{uuid.uuid4().hex[:10]}@example.com"


def _unique_cpf() -> str:
    return uuid.uuid4().hex[:11]


def _docker_compose(*args: str) -> None:
    subprocess.run(["docker", "compose", *args], cwd=REPO_ROOT, check=True, capture_output=True)


def _wait_until_healthy(url: str, timeout: float = 20.0) -> None:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            if httpx.get(url, timeout=2).status_code == 200:
                return
        except httpx.HTTPError:
            pass
        time.sleep(0.5)
    raise TimeoutError(f"{url} não voltou a responder a tempo")


def _pick_available_room(api_base: str, checkin: str, checkout: str) -> int:
    response = httpx.get(
        f"{api_base}/rooms/availability",
        params={"checkin": checkin, "checkout": checkout, "pax": 1},
        timeout=10,
    )
    response.raise_for_status()
    rooms = response.json()
    assert rooms, f"nenhum quarto disponível em {checkin}..{checkout} para montar o teste"
    return rooms[0]["id"]


# ---------------------------------------------------------------------------
# CG-01 — Caminho de sucesso: reserva real gera fatura real no serviço externo
# ---------------------------------------------------------------------------
def test_cg01_booking_registers_invoice_in_external_finance_service(api_base, finance_base):
    checkin, checkout = "2027-02-10", "2027-02-12"
    room_id = _pick_available_room(api_base, checkin, checkout)

    booking = httpx.post(
        f"{api_base}/guest-portal/bookings",
        json={
            "room_id": room_id,
            "checkin": checkin,
            "checkout": checkout,
            "guests": 1,
            "guest_name": "Gray Box CG01",
            "guest_email": _unique_email("cg01"),
            "guest_phone": "(11) 90000-0001",
            "guest_cpf": _unique_cpf(),
        },
        timeout=10,
    )
    assert booking.status_code == 201, booking.text
    reservation = booking.json()

    invoices = httpx.get(f"{finance_base}/invoices", timeout=10).json()
    matching = [inv for inv in invoices if inv["reservation_code"] == reservation["code"]]

    assert matching, "a fatura correspondente não apareceu no sistema financeiro externo"
    assert matching[0]["kind"] == "reserva"
    assert matching[0]["amount"] == reservation["total"]


# ---------------------------------------------------------------------------
# CG-02 — Caminho de falha de comunicação: financeiro fora do ar não bloqueia a reserva
# ---------------------------------------------------------------------------
def test_cg02_booking_succeeds_even_if_finance_service_is_down(api_base, finance_base):
    checkin, checkout = "2027-03-10", "2027-03-12"
    room_id = _pick_available_room(api_base, checkin, checkout)

    _docker_compose("stop", "finance")
    try:
        booking = httpx.post(
            f"{api_base}/guest-portal/bookings",
            json={
                "room_id": room_id,
                "checkin": checkin,
                "checkout": checkout,
                "guests": 1,
                "guest_name": "Gray Box CG02",
                "guest_email": _unique_email("cg02"),
                "guest_phone": "(11) 90000-0002",
                "guest_cpf": _unique_cpf(),
            },
            timeout=10,
        )
        assert booking.status_code == 201, (
            "a reserva não deveria ser bloqueada por uma falha no sistema financeiro externo: "
            f"{booking.status_code} {booking.text}"
        )
    finally:
        _docker_compose("start", "finance")
        _wait_until_healthy(f"{finance_base}/health")


# ---------------------------------------------------------------------------
# CG-04 — Checagem de duplicidade isolada: mesmo CPF, e-mail diferente
# ---------------------------------------------------------------------------
def test_cg04_guest_duplicate_cpf_with_different_email_is_rejected(api_base, auth_headers):
    shared_cpf = _unique_cpf()

    first = httpx.post(
        f"{api_base}/guests",
        headers=auth_headers,
        json={"name": "Gray Box CG04 A", "email": _unique_email("cg04a"), "phone": "(11) 90000-0003", "cpf": shared_cpf},
        timeout=10,
    )
    assert first.status_code == 201, first.text

    second = httpx.post(
        f"{api_base}/guests",
        headers=auth_headers,
        json={"name": "Gray Box CG04 B", "email": _unique_email("cg04b"), "phone": "(11) 90000-0004", "cpf": shared_cpf},
        timeout=10,
    )
    assert second.status_code == 409, (
        f"CPF duplicado com e-mail diferente deveria ser rejeitado com 409, veio {second.status_code}: {second.text}"
    )
    assert "cpf" in second.json()["detail"].lower()


# ---------------------------------------------------------------------------
# CG-05 — Transição automática de status: ocorre na leitura, não num job separado
# ---------------------------------------------------------------------------
def test_cg05_past_reservation_shows_as_checkout_on_read(api_base, auth_headers, db_dsn):
    guest = httpx.post(
        f"{api_base}/guests",
        headers=auth_headers,
        json={"name": "Gray Box CG05", "email": _unique_email("cg05"), "phone": "(11) 90000-0005", "cpf": _unique_cpf()},
        timeout=10,
    ).json()

    rooms = httpx.get(f"{api_base}/rooms", headers=auth_headers, timeout=10).json()
    assert rooms
    room_id = rooms[0]["id"]

    code = f"RES-GB{uuid.uuid4().hex[:6].upper()}"

    async def _insert_past_reservation() -> int:
        conn = await asyncpg.connect(db_dsn)
        try:
            return await conn.fetchval(
                """
                INSERT INTO reservations (code, guest_id, room_id, checkin, checkout, guests, status, total)
                VALUES ($1, $2, $3, $4, $5, $6, 'confirmada'::reservation_status, $7)
                RETURNING id
                """,
                code, guest["id"], room_id, date(2020, 1, 1), date(2020, 1, 3), 1, 200.0,
            )
        finally:
            await conn.close()

    reservation_id = asyncio.run(_insert_past_reservation())

    response = httpx.get(f"{api_base}/reservations/{reservation_id}", headers=auth_headers, timeout=10)
    assert response.status_code == 200
    assert response.json()["status"] == "checkout", (
        "reserva com checkout no passado deveria ter sido encerrada automaticamente na leitura"
    )


# ---------------------------------------------------------------------------
# CG-03 — Limiar exato do rate limit de login (5/minuto)
#
# Roda por último de propósito: o limiter do slowapi é por IP, não por
# credencial, então exaurir a cota aqui bloquearia o login usado pela
# fixture `auth_token` nos testes seguintes.
# ---------------------------------------------------------------------------
def test_cg03_login_rate_limit_blocks_after_five_attempts_per_minute(api_base):
    statuses = []
    for _ in range(8):
        response = httpx.post(
            f"{api_base}/auth/login",
            json={"email": "ana.souza@hotel.com", "password": "senha-errada"},
            timeout=10,
        )
        statuses.append(response.status_code)
        if response.status_code == 429:
            break
        time.sleep(0.05)

    assert 429 in statuses, f"o rate limit nunca disparou dentro de 8 tentativas: {statuses}"
    first_block = statuses.index(429)
    # antes do bloqueio, toda tentativa com senha errada deve dar 401 (nunca 200/500)
    assert all(s == 401 for s in statuses[:first_block]), statuses
    assert first_block <= 5, f"o bloqueio deveria ocorrer no máximo na 6ª tentativa: {statuses}"

    # o bloqueio persiste (não é "um erro isolado")
    again = httpx.post(
        f"{api_base}/auth/login",
        json={"email": "ana.souza@hotel.com", "password": "senha-errada"},
        timeout=10,
    )
    assert again.status_code == 429
