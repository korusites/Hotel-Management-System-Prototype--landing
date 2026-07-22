from fastapi import APIRouter, Depends

from app.deps import require_role
from app.integrations import finance_client

router = APIRouter(prefix="/finance", tags=["finance"])

admin_or_manager = require_role("administrador", "gerente")


@router.get("/invoices")
async def list_invoices(_staff=Depends(admin_or_manager)) -> list[dict]:
    return await finance_client.list_invoices()
