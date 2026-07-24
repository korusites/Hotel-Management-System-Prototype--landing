from datetime import date

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.staff import StaffRole, StaffStatus


class StaffBase(BaseModel):
    name: str
    email: EmailStr
    cpf: str
    phone: str | None = None
    role: StaffRole
    department: str | None = None
    since: date


class StaffCreate(StaffBase):
    password: str


class StaffUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    cpf: str | None = None
    phone: str | None = None
    role: StaffRole | None = None
    department: str | None = None
    status: StaffStatus | None = None
    password: str | None = None


class StaffRead(StaffBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: StaffStatus
