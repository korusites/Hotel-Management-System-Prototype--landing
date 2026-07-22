from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import reservation as reservation_crud
from app.deps import get_current_staff, require_role
from app.models.reservation import ReservationStatus
from app.schemas.reservation import ReservationCreate, ReservationRead, ReservationUpdate

router = APIRouter(prefix="/reservations", tags=["reservations"])

can_manage = require_role("administrador", "gerente", "recepcionista")


@router.get("", response_model=list[ReservationRead])
async def list_reservations(
    status_filter: ReservationStatus | None = None,
    db: AsyncSession = Depends(get_db),
    _staff=Depends(get_current_staff),
) -> list[ReservationRead]:
    return await reservation_crud.list_reservations(db, status_filter)


@router.get("/{reservation_id}", response_model=ReservationRead)
async def get_reservation(
    reservation_id: int,
    db: AsyncSession = Depends(get_db),
    _staff=Depends(get_current_staff),
) -> ReservationRead:
    reservation = await reservation_crud.get_reservation(db, reservation_id)
    if reservation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Reserva não encontrada")
    return reservation


@router.post("", response_model=ReservationRead, status_code=status.HTTP_201_CREATED)
async def create_reservation(
    payload: ReservationCreate, db: AsyncSession = Depends(get_db), _staff=Depends(can_manage)
) -> ReservationRead:
    try:
        return await reservation_crud.create_reservation(db, payload)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc


@router.patch("/{reservation_id}", response_model=ReservationRead)
async def update_reservation(
    reservation_id: int,
    payload: ReservationUpdate,
    db: AsyncSession = Depends(get_db),
    _staff=Depends(can_manage),
) -> ReservationRead:
    reservation = await reservation_crud.get_reservation(db, reservation_id)
    if reservation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Reserva não encontrada")
    try:
        return await reservation_crud.update_reservation(db, reservation, payload)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
