import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field

DB_PATH = os.environ.get("FINANCE_DB_PATH", "/data/finance.db")

app = FastAPI(title="Sistema Financeiro (externo)", version="0.1.0")


def init_db() -> None:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reservation_code TEXT NOT NULL,
                guest_name TEXT NOT NULL,
                amount REAL NOT NULL,
                kind TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reservation_code TEXT NOT NULL,
                amount REAL NOT NULL,
                payment_method TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


init_db()


class InvoiceCreate(BaseModel):
    reservation_code: str
    guest_name: str
    amount: float
    kind: Literal["reserva", "cancelamento"]


class InvoiceRead(InvoiceCreate):
    id: int
    status: str
    created_at: str


PaymentMethod = Literal["dinheiro", "cartao_credito", "cartao_debito", "pix", "transferencia"]


class PaymentCreate(BaseModel):
    reservation_code: str
    amount: float = Field(gt=0, description="Valor do pagamento, deve ser positivo")
    payment_method: PaymentMethod


class PaymentRead(PaymentCreate):
    id: int
    status: str
    created_at: str


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": "finance"}


@app.post("/invoices", response_model=InvoiceRead, status_code=status.HTTP_201_CREATED)
async def create_invoice(payload: InvoiceCreate) -> InvoiceRead:
    created_at = datetime.now(timezone.utc).isoformat()
    with get_conn() as conn:
        cursor = conn.execute(
            "INSERT INTO invoices (reservation_code, guest_name, amount, kind, status, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (payload.reservation_code, payload.guest_name, payload.amount, payload.kind, "registrado", created_at),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM invoices WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return InvoiceRead(**dict(row))


@app.get("/invoices", response_model=list[InvoiceRead])
async def list_invoices() -> list[InvoiceRead]:
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM invoices ORDER BY id DESC").fetchall()
    return [InvoiceRead(**dict(row)) for row in rows]


@app.get("/invoices/{invoice_id}", response_model=InvoiceRead)
async def get_invoice(invoice_id: int) -> InvoiceRead:
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM invoices WHERE id = ?", (invoice_id,)).fetchone()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Fatura não encontrada")
    return InvoiceRead(**dict(row))


@app.post("/payments", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
async def create_payment(payload: PaymentCreate) -> PaymentRead:
    created_at = datetime.now(timezone.utc).isoformat()
    with get_conn() as conn:
        cursor = conn.execute(
            "INSERT INTO payments (reservation_code, amount, payment_method, status, created_at) "
            "VALUES (?, ?, ?, ?, ?)",
            (payload.reservation_code, payload.amount, payload.payment_method, "confirmado", created_at),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM payments WHERE id = ?", (cursor.lastrowid,)).fetchone()
    return PaymentRead(**dict(row))


@app.get("/payments", response_model=list[PaymentRead])
async def list_payments() -> list[PaymentRead]:
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM payments ORDER BY id DESC").fetchall()
    return [PaymentRead(**dict(row)) for row in rows]
