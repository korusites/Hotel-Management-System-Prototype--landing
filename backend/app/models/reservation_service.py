from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ReservationService(Base):
    __tablename__ = "reservation_services"

    id: Mapped[int] = mapped_column(primary_key=True)
    reservation_id: Mapped[int] = mapped_column(
        ForeignKey("reservations.id", ondelete="CASCADE")
    )
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id"))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2))
    created_at: Mapped[date] = mapped_column(Date)

    reservation: Mapped["Reservation"] = relationship(back_populates="consumed_services")
    service: Mapped["Service"] = relationship(back_populates="consumptions")

    @property
    def total(self) -> float:
        return float(self.unit_price) * self.quantity

    @property
    def service_name(self) -> str:
        return self.service.name
