from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import guest as guest_crud
from app.crud import reservation as reservation_crud
from app.models.reservation import ReservationStatus
from app.schemas.guest import GuestCreate
from app.schemas.reservation import PublicBookingCreate, ReservationCreate, ReservationRead

router = APIRouter(prefix="/guest-portal", tags=["guest-portal"])

# Rotas públicas, sem autenticação: espelham o comportamento do protótipo
# ("Demo: qualquer e-mail funciona"), mas o cancelamento aqui exige que o
# e-mail informado corresponda ao da reserva, o que o mock original não fazia.


@router.get("/reservations", response_model=list[ReservationRead])
async def my_reservations(
    email: EmailStr, db: AsyncSession = Depends(get_db)
) -> list[ReservationRead]:
    guest = await guest_crud.get_guest_by_email(db, email)
    if guest is None:
        return []
    reservations = await reservation_crud.list_reservations(db)
    return [r for r in reservations if r.guest_id == guest.id]


@router.post("/bookings", response_model=ReservationRead, status_code=status.HTTP_201_CREATED)
async def create_booking(
    payload: PublicBookingCreate, db: AsyncSession = Depends(get_db)
) -> ReservationRead:
    guest = await guest_crud.get_guest_by_email(db, payload.guest_email)
    if guest is None:
        guest = await guest_crud.create_guest(
            db,
            GuestCreate(
                name=payload.guest_name,
                email=payload.guest_email,
                phone=payload.guest_phone,
                cpf=payload.guest_cpf,
            ),
        )

    reservation_data = ReservationCreate(
        guest_id=guest.id,
        room_id=payload.room_id,
        checkin=payload.checkin,
        checkout=payload.checkout,
        guests=payload.guests,
    )
    try:
        return await reservation_crud.create_reservation(db, reservation_data)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc


@router.post("/reservations/{reservation_id}/cancel", response_model=ReservationRead)
async def cancel_my_reservation(
    reservation_id: int, guest_email: EmailStr, db: AsyncSession = Depends(get_db)
) -> ReservationRead:
    reservation = await reservation_crud.get_reservation(db, reservation_id)
    if reservation is None or reservation.guest.email.lower() != guest_email.lower():
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Reserva não encontrada")
    if reservation.status == ReservationStatus.cancelada:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Reserva já está cancelada")
    if reservation.status == ReservationStatus.checkout:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Reserva já concluída")
    return await reservation_crud.cancel_reservation(db, reservation)
