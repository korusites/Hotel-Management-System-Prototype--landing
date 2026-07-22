from datetime import date

from pydantic import BaseModel, ConfigDict


class ReservationServiceCreate(BaseModel):
    service_id: int
    quantity: int = 1


class ReservationServiceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    service_id: int
    service_name: str
    unit_price: float
    quantity: int
    total: float
    created_at: date
