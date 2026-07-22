from sqlalchemy import Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Guest(Base):
    __tablename__ = "guests"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    phone: Mapped[str] = mapped_column(String(30))
    cpf: Mapped[str] = mapped_column(String(20), unique=True)
    city: Mapped[str | None] = mapped_column(String(200), nullable=True)
    rating: Mapped[float] = mapped_column(Numeric(2, 1), default=5)

    reservations: Mapped[list["Reservation"]] = relationship(back_populates="guest")
