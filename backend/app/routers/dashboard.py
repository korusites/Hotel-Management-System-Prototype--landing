from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import dashboard as dashboard_crud
from app.deps import get_current_staff
from app.schemas.dashboard import DashboardStats, OccupancyPoint, RevenuePoint

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def stats(
    db: AsyncSession = Depends(get_db), _staff=Depends(get_current_staff)
) -> DashboardStats:
    return DashboardStats(**await dashboard_crud.get_stats(db))


@router.get("/revenue", response_model=list[RevenuePoint])
async def revenue(
    db: AsyncSession = Depends(get_db), _staff=Depends(get_current_staff)
) -> list[RevenuePoint]:
    return await dashboard_crud.get_monthly_revenue(db)


@router.get("/occupancy", response_model=list[OccupancyPoint])
async def occupancy(
    db: AsyncSession = Depends(get_db), _staff=Depends(get_current_staff)
) -> list[OccupancyPoint]:
    return await dashboard_crud.get_weekly_occupancy(db)
