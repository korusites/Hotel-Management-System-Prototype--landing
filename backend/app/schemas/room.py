from pydantic import BaseModel, ConfigDict

from app.models.room import RoomStatus, RoomType


class RoomBase(BaseModel):
    number: str
    floor: int
    type: RoomType
    capacity: int
    price: float
    amenities: list[str] = []
    img: str | None = None


class RoomCreate(RoomBase):
    status: RoomStatus = RoomStatus.disponivel


class RoomUpdate(BaseModel):
    number: str | None = None
    floor: int | None = None
    type: RoomType | None = None
    status: RoomStatus | None = None
    capacity: int | None = None
    price: float | None = None
    amenities: list[str] | None = None
    img: str | None = None


class RoomRead(RoomBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: RoomStatus
