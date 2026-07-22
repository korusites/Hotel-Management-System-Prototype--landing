from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.reservation import Reservation, ReservationStatus
from app.models.room import Room, RoomStatus
from app.schemas.reservation import ReservationCreate, ReservationUpdate

ACTIVE_STATUSES = (ReservationStatus.confirmada, ReservationStatus.pendente)

WITH_RELATIONS = (selectinload(Reservation.guest), selectinload(Reservation.room))


async def list_reservations(
    db: AsyncSession, status: ReservationStatus | None = None, limit: int = 200
) -> list[Reservation]:
    query = (
        select(Reservation)
        .options(*WITH_RELATIONS)
        .order_by(Reservation.checkin.desc())
        .limit(limit)
    )
    if status is not None:
        query = query.where(Reservation.status == status)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_reservation(db: AsyncSession, reservation_id: int) -> Reservation | None:
    query = select(Reservation).options(*WITH_RELATIONS).where(Reservation.id == reservation_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def _has_overlap(
    db: AsyncSession,
    room_id: int,
    checkin: date,
    checkout: date,
    exclude_id: int | None = None,
) -> bool:
    query = select(Reservation.id).where(
        Reservation.room_id == room_id,
        Reservation.status.in_(ACTIVE_STATUSES),
        Reservation.checkin < checkout,
        Reservation.checkout > checkin,
    )
    if exclude_id is not None:
        query = query.where(Reservation.id != exclude_id)
    result = await db.execute(query.limit(1))
    return result.first() is not None


async def _sync_room_status(db: AsyncSession, room: Room) -> None:
    if room.status == RoomStatus.manutencao:
        return
    today = date.today()
    active_query = select(Reservation).where(
        Reservation.room_id == room.id,
        Reservation.status.in_(ACTIVE_STATUSES),
    )
    result = await db.execute(active_query)
    active_reservations = result.scalars().all()

    if any(r.checkin <= today < r.checkout for r in active_reservations):
        room.status = RoomStatus.ocupado
    elif any(r.checkin > today for r in active_reservations):
        room.status = RoomStatus.reservado
    else:
        room.status = RoomStatus.disponivel


async def create_reservation(db: AsyncSession, data: ReservationCreate) -> Reservation:
    room = await db.get(Room, data.room_id)
    if room is None:
        raise ValueError("Quarto não encontrado")
    if room.status == RoomStatus.manutencao:
        raise ValueError("Quarto em manutenção")
    if data.guests > room.capacity:
        raise ValueError("Número de hóspedes excede a capacidade do quarto")
    if await _has_overlap(db, data.room_id, data.checkin, data.checkout):
        raise ValueError("Quarto não disponível no período selecionado")

    nights = (data.checkout - data.checkin).days
    reservation = Reservation(
        code="PENDING",
        guest_id=data.guest_id,
        room_id=data.room_id,
        checkin=data.checkin,
        checkout=data.checkout,
        guests=data.guests,
        total=float(room.price) * nights,
        status=ReservationStatus.confirmada,
    )
    db.add(reservation)
    await db.flush()
    reservation.code = f"RES-{reservation.id:04d}"
    await _sync_room_status(db, room)
    await db.commit()
    return await get_reservation(db, reservation.id)


async def update_reservation(
    db: AsyncSession, reservation: Reservation, data: ReservationUpdate
) -> Reservation:
    changes = data.model_dump(exclude_unset=True)
    new_checkin = changes.get("checkin", reservation.checkin)
    new_checkout = changes.get("checkout", reservation.checkout)

    if "checkin" in changes or "checkout" in changes:
        if new_checkout <= new_checkin:
            raise ValueError("checkout deve ser depois do checkin")
        if await _has_overlap(
            db, reservation.room_id, new_checkin, new_checkout, exclude_id=reservation.id
        ):
            raise ValueError("Quarto não disponível no período selecionado")

    room = await db.get(Room, reservation.room_id)
    for field, value in changes.items():
        setattr(reservation, field, value)

    if "checkin" in changes or "checkout" in changes:
        nights = (reservation.checkout - reservation.checkin).days
        reservation.total = float(room.price) * nights

    await _sync_room_status(db, room)
    await db.commit()
    return await get_reservation(db, reservation.id)


async def cancel_reservation(db: AsyncSession, reservation: Reservation) -> Reservation:
    reservation.status = ReservationStatus.cancelada
    room = await db.get(Room, reservation.room_id)
    await _sync_room_status(db, room)
    await db.commit()
    return await get_reservation(db, reservation.id)
