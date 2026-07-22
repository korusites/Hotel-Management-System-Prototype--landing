from pydantic import BaseModel, ConfigDict


class ServiceBase(BaseModel):
    name: str
    category: str
    price: float
    unit: str
    available: bool = True


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: str | None = None
    category: str | None = None
    price: float | None = None
    unit: str | None = None
    available: bool | None = None


class ServiceRead(ServiceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    used: int
