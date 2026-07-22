import enum

from sqlalchemy import ARRAY, Enum as SAEnum, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class RoomType(str, enum.Enum):
    standard = "Standard"
    luxo = "Luxo"
    suite = "Suite"
    presidencial = "Presidencial"


class RoomStatus(str, enum.Enum):
    disponivel = "disponivel"
    ocupado = "ocupado"
    manutencao = "manutencao"
    reservado = "reservado"


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(primary_key=True)
    number: Mapped[str] = mapped_column(String(10), unique=True, index=True)
    floor: Mapped[int] = mapped_column(Integer)
    type: Mapped[RoomType] = mapped_column(SAEnum(RoomType, name="room_type"))
    status: Mapped[RoomStatus] = mapped_column(
        SAEnum(RoomStatus, name="room_status"), default=RoomStatus.disponivel
    )
    capacity: Mapped[int] = mapped_column(Integer)
    price: Mapped[float] = mapped_column(Numeric(10, 2))
    amenities: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    img: Mapped[str | None] = mapped_column(String(500), nullable=True)

    reservations: Mapped[list["Reservation"]] = relationship(back_populates="room")
