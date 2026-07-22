from datetime import date

from pydantic import BaseModel, ConfigDict, EmailStr


class GuestBase(BaseModel):
    name: str
    email: EmailStr
    phone: str
    cpf: str
    city: str | None = None


class GuestCreate(GuestBase):
    rating: float = 5


class GuestUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    cpf: str | None = None
    city: str | None = None
    rating: float | None = None


class GuestRead(GuestBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    rating: float


class GuestReadWithStats(GuestRead):
    stays: int
    last_stay: date | None = None
