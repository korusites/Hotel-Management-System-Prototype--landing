from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import service as service_crud
from app.deps import get_current_staff, require_role
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceRead, ServiceUpdate

router = APIRouter(prefix="/services", tags=["services"])

can_manage = require_role("administrador", "gerente")


def _to_read(service: Service, usage: dict[int, int]) -> ServiceRead:
    return ServiceRead(
        id=service.id,
        name=service.name,
        category=service.category,
        price=float(service.price),
        unit=service.unit,
        available=service.available,
        used=usage.get(service.id, 0),
    )


@router.get("", response_model=list[ServiceRead])
async def list_services(
    db: AsyncSession = Depends(get_db), _staff=Depends(get_current_staff)
) -> list[ServiceRead]:
    services = await service_crud.list_services(db)
    usage = await service_crud.usage_counts(db)
    return [_to_read(s, usage) for s in services]


@router.post("", response_model=ServiceRead, status_code=status.HTTP_201_CREATED)
async def create_service(
    payload: ServiceCreate, db: AsyncSession = Depends(get_db), _staff=Depends(can_manage)
) -> ServiceRead:
    service = await service_crud.create_service(db, payload)
    return _to_read(service, {})


@router.patch("/{service_id}", response_model=ServiceRead)
async def update_service(
    service_id: int,
    payload: ServiceUpdate,
    db: AsyncSession = Depends(get_db),
    _staff=Depends(can_manage),
) -> ServiceRead:
    service = await service_crud.get_service(db, service_id)
    if service is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Serviço não encontrado")
    service = await service_crud.update_service(db, service, payload)
    usage = await service_crud.usage_counts(db)
    return _to_read(service, usage)


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: int, db: AsyncSession = Depends(get_db), _staff=Depends(can_manage)
) -> None:
    service = await service_crud.get_service(db, service_id)
    if service is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Serviço não encontrado")
    await service_crud.delete_service(db, service)
