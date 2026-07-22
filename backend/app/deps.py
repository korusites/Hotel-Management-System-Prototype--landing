from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.crud import staff as staff_crud
from app.models.staff import StaffMember, StaffStatus

bearer_scheme = HTTPBearer()


async def get_current_staff(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> StaffMember:
    try:
        payload = decode_access_token(credentials.credentials)
    except ValueError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, str(exc)) from exc

    staff = await staff_crud.get_staff(db, int(payload["sub"]))
    if staff is None or staff.status != StaffStatus.ativo:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Usuário inválido ou inativo")
    return staff


def require_role(*roles: str):
    async def checker(staff: StaffMember = Depends(get_current_staff)) -> StaffMember:
        if staff.role.value not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso não autorizado para este papel")
        return staff

    return checker
