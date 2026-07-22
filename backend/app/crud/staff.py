from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.staff import StaffMember
from app.schemas.staff import StaffCreate, StaffUpdate


async def list_staff(db: AsyncSession, limit: int = 200) -> list[StaffMember]:
    result = await db.execute(select(StaffMember).order_by(StaffMember.name).limit(limit))
    return list(result.scalars().all())


async def get_staff(db: AsyncSession, staff_id: int) -> StaffMember | None:
    return await db.get(StaffMember, staff_id)


async def get_staff_by_email(db: AsyncSession, email: str) -> StaffMember | None:
    result = await db.execute(
        select(StaffMember).where(func.lower(StaffMember.email) == email.lower())
    )
    return result.scalar_one_or_none()


async def create_staff(db: AsyncSession, data: StaffCreate) -> StaffMember:
    payload = data.model_dump(exclude={"password"})
    staff = StaffMember(**payload, hashed_password=hash_password(data.password))
    db.add(staff)
    await db.commit()
    await db.refresh(staff)
    return staff


async def update_staff(db: AsyncSession, staff: StaffMember, data: StaffUpdate) -> StaffMember:
    changes = data.model_dump(exclude_unset=True)
    password = changes.pop("password", None)
    for field, value in changes.items():
        setattr(staff, field, value)
    if password:
        staff.hashed_password = hash_password(password)
    await db.commit()
    await db.refresh(staff)
    return staff


async def delete_staff(db: AsyncSession, staff: StaffMember) -> None:
    await db.delete(staff)
    await db.commit()
