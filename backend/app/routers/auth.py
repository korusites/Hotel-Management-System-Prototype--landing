from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import create_access_token, verify_password
from app.crud import staff as staff_crud
from app.models.staff import StaffStatus
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    staff = await staff_crud.get_staff_by_email(db, payload.email)
    if (
        staff is None
        or staff.status != StaffStatus.ativo
        or not verify_password(payload.password, staff.hashed_password)
    ):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Credenciais inválidas")

    token = create_access_token(subject=str(staff.id), role=staff.role.value)
    return TokenResponse(access_token=token, role=staff.role.value)
