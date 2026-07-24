from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.reservation import Reservation, ReservationStatus
from app.models.reservation_service import ReservationService
from app.models.service import Service
from app.schemas.reservation_service import ReservationServiceCreate


async def list_for_reservation(db: AsyncSession, reservation_id: int) -> list[ReservationService]:
    query = (
        select(ReservationService)
        .options(selectinload(ReservationService.service))
        .where(ReservationService.reservation_id == reservation_id)
        .order_by(ReservationService.created_at.desc())
    )
    result = await db.execute(query)
    return list(result.scalars().all())


async def add_consumption(
    db: AsyncSession, reservation: Reservation, data: ReservationServiceCreate
) -> ReservationService:
    if reservation.status in (ReservationStatus.cancelada, ReservationStatus.checkout):
        raise ValueError("Não é possível lançar serviços em uma hospedagem já finalizada")

    service = await db.get(Service, data.service_id)
    if service is None:
        raise ValueError("Serviço não encontrado")
    if not service.available:
        raise ValueError("Serviço indisponível")

    consumption = ReservationService(
        reservation_id=reservation.id,
        service_id=service.id,
        quantity=data.quantity,
        unit_price=service.price,
        created_at=date.today(),
    )
    db.add(consumption)
    await db.flush()
    await db.commit()

    result = await db.execute(
        select(ReservationService)
        .options(selectinload(ReservationService.service))
        .where(ReservationService.id == consumption.id)
    )
    return result.scalar_one()


async def get_consumption(db: AsyncSession, consumption_id: int) -> ReservationService | None:
    return await db.get(ReservationService, consumption_id)


async def remove_consumption(db: AsyncSession, consumption: ReservationService) -> None:
    await db.delete(consumption)
    await db.commit()
