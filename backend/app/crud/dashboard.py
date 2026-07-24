from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.guest import Guest
from app.models.reservation import Reservation, ReservationStatus
from app.models.room import Room, RoomStatus

ACTIVE_STATUSES = (ReservationStatus.confirmada, ReservationStatus.pendente)


async def get_stats(db: AsyncSession) -> dict:
    total_rooms = (await db.execute(select(func.count(Room.id)))).scalar_one()
    occupied_rooms = (
        await db.execute(select(func.count(Room.id)).where(Room.status == RoomStatus.ocupado))
    ).scalar_one()

    today = date.today()
    month_start = today.replace(day=1)
    next_month = (month_start + timedelta(days=32)).replace(day=1)
    revenue_month = (
        await db.execute(
            select(func.coalesce(func.sum(Reservation.total), 0)).where(
                Reservation.checkin >= month_start,
                Reservation.checkin < next_month,
                Reservation.status != ReservationStatus.cancelada,
            )
        )
    ).scalar_one()

    reservations_count = (
        await db.execute(
            select(func.count(Reservation.id)).where(Reservation.status.in_(ACTIVE_STATUSES))
        )
    ).scalar_one()

    guests_count = (await db.execute(select(func.count(Guest.id)))).scalar_one()

    occupancy_rate = round((occupied_rooms / total_rooms) * 100, 1) if total_rooms else 0.0

    return {
        "occupancy_rate": occupancy_rate,
        "occupied_rooms": occupied_rooms,
        "total_rooms": total_rooms,
        "revenue_month": float(revenue_month),
        "reservations_count": reservations_count,
        "guests_count": guests_count,
    }


async def get_monthly_revenue(db: AsyncSession, months: int = 12) -> list[dict]:
    today = date.today()
    points = []
    for i in range(months - 1, -1, -1):
        month_index = today.month - 1 - i
        year = today.year + month_index // 12
        month = month_index % 12 + 1
        start = date(year, month, 1)
        end = (start + timedelta(days=32)).replace(day=1)
        revenue = (
            await db.execute(
                select(func.coalesce(func.sum(Reservation.total), 0)).where(
                    Reservation.checkin >= start,
                    Reservation.checkin < end,
                    Reservation.status != ReservationStatus.cancelada,
                )
            )
        ).scalar_one()
        points.append({"month": start.strftime("%b"), "receita": float(revenue)})
    return points


async def get_revenue_for_period(db: AsyncSession, start: date, end: date) -> list[dict]:
    points = []
    cursor = start.replace(day=1)
    last_month = end.replace(day=1)
    while cursor <= last_month:
        month_end = (cursor + timedelta(days=32)).replace(day=1)
        revenue = (
            await db.execute(
                select(func.coalesce(func.sum(Reservation.total), 0)).where(
                    Reservation.checkin >= max(cursor, start),
                    Reservation.checkin < min(month_end, end + timedelta(days=1)),
                    Reservation.status != ReservationStatus.cancelada,
                )
            )
        ).scalar_one()
        points.append({"month": cursor.strftime("%b/%Y"), "receita": float(revenue)})
        cursor = month_end
    return points


async def get_weekly_occupancy(db: AsyncSession) -> list[dict]:
    total_rooms = (await db.execute(select(func.count(Room.id)))).scalar_one()
    today = date.today()
    points = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        occupied = (
            await db.execute(
                select(func.count(func.distinct(Reservation.room_id))).where(
                    Reservation.status.in_(ACTIVE_STATUSES),
                    Reservation.checkin <= day,
                    Reservation.checkout > day,
                )
            )
        ).scalar_one()
        rate = round((occupied / total_rooms) * 100, 1) if total_rooms else 0.0
        points.append({"day": day.strftime("%a"), "occupancy_rate": rate})
    return points
