from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import staff as staff_crud
from app.deps import require_role
from app.schemas.staff import StaffCreate, StaffRead, StaffUpdate

router = APIRouter(prefix="/staff", tags=["staff"])

can_view = require_role("administrador", "gerente")
admin_only = require_role("administrador")


@router.get("", response_model=list[StaffRead])
async def list_staff(
    limit: int = Query(200, le=500),
    db: AsyncSession = Depends(get_db),
    _staff=Depends(can_view),
) -> list[StaffRead]:
    return await staff_crud.list_staff(db, limit)


@router.get("/{staff_id}", response_model=StaffRead)
async def get_staff(
    staff_id: int, db: AsyncSession = Depends(get_db), _staff=Depends(can_view)
) -> StaffRead:
    staff = await staff_crud.get_staff(db, staff_id)
    if staff is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Funcionário não encontrado")
    return staff


@router.post("", response_model=StaffRead, status_code=status.HTTP_201_CREATED)
async def create_staff(
    payload: StaffCreate, db: AsyncSession = Depends(get_db), _staff=Depends(admin_only)
) -> StaffRead:
    existing = await staff_crud.get_staff_by_email(db, payload.email)
    if existing is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Já existe um funcionário com este email")
    existing_cpf = await staff_crud.get_staff_by_cpf(db, payload.cpf)
    if existing_cpf is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Já existe um funcionário com este CPF")
    return await staff_crud.create_staff(db, payload)


@router.patch("/{staff_id}", response_model=StaffRead)
async def update_staff(
    staff_id: int,
    payload: StaffUpdate,
    db: AsyncSession = Depends(get_db),
    _staff=Depends(admin_only),
) -> StaffRead:
    staff = await staff_crud.get_staff(db, staff_id)
    if staff is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Funcionário não encontrado")
    if payload.cpf is not None and payload.cpf != staff.cpf:
        existing_cpf = await staff_crud.get_staff_by_cpf(db, payload.cpf)
        if existing_cpf is not None:
            raise HTTPException(status.HTTP_409_CONFLICT, "Já existe um funcionário com este CPF")
    return await staff_crud.update_staff(db, staff, payload)


@router.delete("/{staff_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_staff(
    staff_id: int, db: AsyncSession = Depends(get_db), _staff=Depends(admin_only)
) -> None:
    staff = await staff_crud.get_staff(db, staff_id)
    if staff is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Funcionário não encontrado")
    await staff_crud.delete_staff(db, staff)
