from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import reservation as reservation_crud
from app.deps import require_role
from app.integrations import finance_client
from app.integrations.finance_client import FinanceServiceError

router = APIRouter(prefix="/finance", tags=["finance"])

admin_or_manager = require_role("administrador", "gerente")
can_register_payment = require_role("administrador", "gerente", "recepcionista")

PaymentMethod = Literal["dinheiro", "cartao_credito", "cartao_debito", "pix", "transferencia"]


class PaymentRequest(BaseModel):
    reservation_code: str
    amount: float = Field(gt=0, description="Valor do pagamento, deve ser positivo")
    payment_method: PaymentMethod


@router.get("/invoices")
async def list_invoices(_staff=Depends(admin_or_manager)) -> list[dict]:
    return await finance_client.list_invoices()


@router.get("/payments")
async def list_payments(_staff=Depends(admin_or_manager)) -> list[dict]:
    return await finance_client.list_payments()


@router.post("/payments", status_code=status.HTTP_201_CREATED)
async def register_payment(
    payload: PaymentRequest,
    db: AsyncSession = Depends(get_db),
    _staff=Depends(can_register_payment),
) -> dict:
    reservation = await reservation_crud.get_reservation_by_code(db, payload.reservation_code)
    if reservation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Reserva não encontrada")
    try:
        return await finance_client.register_payment(
            payload.reservation_code, payload.amount, payload.payment_method
        )
    except FinanceServiceError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, str(exc)) from exc
