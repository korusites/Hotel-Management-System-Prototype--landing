from datetime import date

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.reservation import Reservation, ReservationStatus
from app.models.room import Room, RoomStatus, RoomType
from app.schemas.room import RoomCreate, RoomUpdate

ACTIVE_STATUSES = (ReservationStatus.confirmada, ReservationStatus.pendente)


async def list_rooms(db: AsyncSession, status: RoomStatus | None = None) -> list[Room]:
    query = select(Room).order_by(Room.number)
    if status is not None:
        query = query.where(Room.status == status)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_room(db: AsyncSession, room_id: int) -> Room | None:
    return await db.get(Room, room_id)


async def get_room_by_number(db: AsyncSession, number: str) -> Room | None:
    result = await db.execute(select(Room).where(Room.number == number))
    return result.scalar_one_or_none()


async def create_room(db: AsyncSession, data: RoomCreate) -> Room:
    room = Room(**data.model_dump())
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return room


async def update_room(db: AsyncSession, room: Room, data: RoomUpdate) -> Room:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(room, field, value)
    await db.commit()
    await db.refresh(room)
    return room


async def delete_room(db: AsyncSession, room: Room) -> None:
    await db.delete(room)
    await db.commit()


async def search_availability(
    db: AsyncSession,
    checkin: date,
    checkout: date,
    pax: int,
    room_type: RoomType | None = None,
) -> list[Room]:
    overlap = and_(
        Reservation.status.in_(ACTIVE_STATUSES),
        Reservation.checkin < checkout,
        Reservation.checkout > checkin,
    )
    subquery = (
        select(Reservation.room_id).where(overlap).distinct()
    )
    query = select(Room).where(
        Room.status != RoomStatus.manutencao,
        Room.capacity >= pax,
        Room.id.not_in(subquery),
    )
    if room_type is not None:
        query = query.where(Room.type == room_type)
    query = query.order_by(Room.price)
    result = await db.execute(query)
    return list(result.scalars().all())


async def catalog(
    db: AsyncSession,
    checkin: date,
    checkout: date,
    pax: int,
    room_type: RoomType | None = None,
) -> list[tuple[Room, bool, date | None]]:
    query = select(Room).where(Room.capacity >= pax)
    if room_type is not None:
        query = query.where(Room.type == room_type)
    query = query.order_by(Room.price)
    rooms = (await db.execute(query)).scalars().all()

    entries = []
    for room in rooms:
        if room.status == RoomStatus.manutencao:
            entries.append((room, False, None))
            continue
        overlap_result = await db.execute(
            select(func.max(Reservation.checkout)).where(
                Reservation.room_id == room.id,
                Reservation.status.in_(ACTIVE_STATUSES),
                Reservation.checkin < checkout,
                Reservation.checkout > checkin,
            )
        )
        available_from = overlap_result.scalar_one_or_none()
        entries.append((room, available_from is None, available_from))
    return entries
