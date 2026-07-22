import enum
from datetime import date

from sqlalchemy import Date, Enum as SAEnum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class StaffRole(str, enum.Enum):
    administrador = "administrador"
    gerente = "gerente"
    recepcionista = "recepcionista"
    governanta = "governanta"


class StaffStatus(str, enum.Enum):
    ativo = "ativo"
    inativo = "inativo"


class StaffMember(Base):
    __tablename__ = "staff_members"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    role: Mapped[StaffRole] = mapped_column(SAEnum(StaffRole, name="staff_role"))
    department: Mapped[str | None] = mapped_column(String(200), nullable=True)
    status: Mapped[StaffStatus] = mapped_column(
        SAEnum(StaffStatus, name="staff_status"), default=StaffStatus.ativo
    )
    since: Mapped[date] = mapped_column(Date)
    hashed_password: Mapped[str] = mapped_column(String(255))
