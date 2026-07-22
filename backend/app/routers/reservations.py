from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import reservation as reservation_crud
from app.crud import reservation_service as reservation_service_crud
from app.deps import get_current_staff, require_role
from app.integrations import finance_client
from app.models.reservation import ReservationStatus
from app.schemas.reservation import ReservationCreate, ReservationRead, ReservationUpdate
from app.schemas.reservation_service import ReservationServiceCreate, ReservationServiceRead

router = APIRouter(prefix="/reservations", tags=["reservations"])

can_manage = require_role("administrador", "gerente", "recepcionista")


@router.get("", response_model=list[ReservationRead])
async def list_reservations(
    status_filter: ReservationStatus | None = None,
    limit: int = Query(200, le=500),
    db: AsyncSession = Depends(get_db),
    _staff=Depends(get_current_staff),
) -> list[ReservationRead]:
    return await reservation_crud.list_reservations(db, status_filter, limit)


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
        reservation = await reservation_crud.create_reservation(db, payload)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
    await finance_client.register_invoice(
        reservation.code, reservation.guest_name, float(reservation.total), "reserva"
    )
    return reservation


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
        updated = await reservation_crud.update_reservation(db, reservation, payload)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
    if payload.status == ReservationStatus.cancelada:
        await finance_client.register_invoice(
            updated.code, updated.guest_name, float(updated.total), "cancelamento"
        )
    return updated


@router.get("/{reservation_id}/services", response_model=list[ReservationServiceRead])
async def list_reservation_services(
    reservation_id: int,
    db: AsyncSession = Depends(get_db),
    _staff=Depends(get_current_staff),
) -> list[ReservationServiceRead]:
    reservation = await reservation_crud.get_reservation(db, reservation_id)
    if reservation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Reserva não encontrada")
    return await reservation_service_crud.list_for_reservation(db, reservation_id)


@router.post(
    "/{reservation_id}/services",
    response_model=ReservationServiceRead,
    status_code=status.HTTP_201_CREATED,
)
async def add_reservation_service(
    reservation_id: int,
    payload: ReservationServiceCreate,
    db: AsyncSession = Depends(get_db),
    _staff=Depends(can_manage),
) -> ReservationServiceRead:
    reservation = await reservation_crud.get_reservation(db, reservation_id)
    if reservation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Reserva não encontrada")
    try:
        return await reservation_service_crud.add_consumption(db, reservation_id, payload)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc


@router.delete("/{reservation_id}/services/{consumption_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_reservation_service(
    reservation_id: int,
    consumption_id: int,
    db: AsyncSession = Depends(get_db),
    _staff=Depends(can_manage),
) -> None:
    consumption = await reservation_service_crud.get_consumption(db, consumption_id)
    if consumption is None or consumption.reservation_id != reservation_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Consumo não encontrado")
    await reservation_service_crud.remove_consumption(db, consumption)
