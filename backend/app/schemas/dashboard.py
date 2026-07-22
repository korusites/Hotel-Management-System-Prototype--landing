from pydantic import BaseModel


class DashboardStats(BaseModel):
    occupancy_rate: float
    occupied_rooms: int
    total_rooms: int
    revenue_month: float
    reservations_count: int
    guests_count: int


class RevenuePoint(BaseModel):
    month: str
    receita: float


class OccupancyPoint(BaseModel):
    day: str
    occupancy_rate: float
