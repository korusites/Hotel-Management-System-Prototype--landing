import httpx

from app.core.config import settings

TIMEOUT = httpx.Timeout(3.0)


async def register_invoice(
    reservation_code: str, guest_name: str, amount: float, kind: str
) -> dict | None:
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.post(
                f"{settings.finance_service_url}/invoices",
                json={
                    "reservation_code": reservation_code,
                    "guest_name": guest_name,
                    "amount": amount,
                    "kind": kind,
                },
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError:
        # Sistema financeiro externo indisponível: não bloqueia o fluxo de reserva.
        return None


async def list_invoices() -> list[dict]:
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            response = await client.get(f"{settings.finance_service_url}/invoices")
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError:
        return []
