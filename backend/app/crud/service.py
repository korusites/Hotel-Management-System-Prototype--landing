from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate


async def list_services(db: AsyncSession) -> list[Service]:
    result = await db.execute(select(Service).order_by(Service.category, Service.name))
    return list(result.scalars().all())


async def get_service(db: AsyncSession, service_id: int) -> Service | None:
    return await db.get(Service, service_id)


async def create_service(db: AsyncSession, data: ServiceCreate) -> Service:
    service = Service(**data.model_dump())
    db.add(service)
    await db.commit()
    await db.refresh(service)
    return service


async def update_service(db: AsyncSession, service: Service, data: ServiceUpdate) -> Service:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(service, field, value)
    await db.commit()
    await db.refresh(service)
    return service


async def delete_service(db: AsyncSession, service: Service) -> None:
    await db.delete(service)
    await db.commit()
