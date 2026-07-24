from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import guest as guest_crud
from app.crud import reservation as reservation_crud
from app.deps import get_current_staff, require_role
from app.models.guest import Guest
from app.schemas.guest import GuestCreate, GuestReadWithStats, GuestUpdate
from app.schemas.reservation import ReservationRead

router = APIRouter(prefix="/guests", tags=["guests"])

admin_or_manager = require_role("administrador", "gerente")


async def _with_stats(db: AsyncSession, guest: Guest) -> GuestReadWithStats:
    stays, last_stay = await guest_crud.get_guest_stats(db, guest.id)
    return GuestReadWithStats(
        id=guest.id,
        name=guest.name,
        email=guest.email,
        phone=guest.phone,
        cpf=guest.cpf,
        city=guest.city,
        rating=guest.rating,
        stays=stays,
        last_stay=last_stay,
    )


@router.get("", response_model=list[GuestReadWithStats])
async def list_guests(
    q: str | None = None,
    limit: int = Query(200, le=500),
    db: AsyncSession = Depends(get_db),
    _staff=Depends(get_current_staff),
) -> list[GuestReadWithStats]:
    guests = await guest_crud.list_guests(db, q, limit)
    return [await _with_stats(db, guest) for guest in guests]


@router.get("/{guest_id}", response_model=GuestReadWithStats)
async def get_guest(
    guest_id: int, db: AsyncSession = Depends(get_db), _staff=Depends(get_current_staff)
) -> GuestReadWithStats:
    guest = await guest_crud.get_guest(db, guest_id)
    if guest is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Hóspede não encontrado")
    return await _with_stats(db, guest)


@router.get("/{guest_id}/reservations", response_model=list[ReservationRead])
async def get_guest_reservations(
    guest_id: int, db: AsyncSession = Depends(get_db), _staff=Depends(get_current_staff)
) -> list[ReservationRead]:
    guest = await guest_crud.get_guest(db, guest_id)
    if guest is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Hóspede não encontrado")
    return await reservation_crud.list_reservations_for_guest(db, guest_id)


@router.post("", response_model=GuestReadWithStats, status_code=status.HTTP_201_CREATED)
async def create_guest(
    payload: GuestCreate, db: AsyncSession = Depends(get_db), _staff=Depends(get_current_staff)
) -> GuestReadWithStats:
    existing = await guest_crud.get_guest_by_email(db, payload.email)
    if existing is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Já existe um hóspede com este email")
    existing_cpf = await guest_crud.get_guest_by_cpf(db, payload.cpf)
    if existing_cpf is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Já existe um hóspede com este CPF")
    guest = await guest_crud.create_guest(db, payload)
    return await _with_stats(db, guest)


@router.patch("/{guest_id}", response_model=GuestReadWithStats)
async def update_guest(
    guest_id: int,
    payload: GuestUpdate,
    db: AsyncSession = Depends(get_db),
    _staff=Depends(get_current_staff),
) -> GuestReadWithStats:
    guest = await guest_crud.get_guest(db, guest_id)
    if guest is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Hóspede não encontrado")
    if payload.cpf is not None and payload.cpf != guest.cpf:
        existing_cpf = await guest_crud.get_guest_by_cpf(db, payload.cpf)
        if existing_cpf is not None:
            raise HTTPException(status.HTTP_409_CONFLICT, "Já existe um hóspede com este CPF")
    guest = await guest_crud.update_guest(db, guest, payload)
    return await _with_stats(db, guest)


@router.delete("/{guest_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_guest(
    guest_id: int, db: AsyncSession = Depends(get_db), _staff=Depends(admin_or_manager)
) -> None:
    guest = await guest_crud.get_guest(db, guest_id)
    if guest is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Hóspede não encontrado")
    await guest_crud.delete_guest(db, guest)
