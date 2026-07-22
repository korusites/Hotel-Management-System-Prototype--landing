from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import room as room_crud
from app.deps import get_current_staff, require_role
from app.models.room import RoomStatus, RoomType
from app.schemas.room import RoomCreate, RoomRead, RoomUpdate

router = APIRouter(prefix="/rooms", tags=["rooms"])

staff_or_manager = require_role("administrador", "gerente")


@router.get("/availability", response_model=list[RoomRead])
async def search_availability(
    checkin: date,
    checkout: date,
    pax: int = 1,
    type: RoomType | None = None,
    db: AsyncSession = Depends(get_db),
) -> list[RoomRead]:
    if checkout <= checkin:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "checkout deve ser depois do checkin")
    rooms = await room_crud.search_availability(db, checkin, checkout, pax, type)
    return rooms


@router.get("", response_model=list[RoomRead])
async def list_rooms(
    status_filter: RoomStatus | None = None,
    db: AsyncSession = Depends(get_db),
    _staff=Depends(get_current_staff),
) -> list[RoomRead]:
    return await room_crud.list_rooms(db, status_filter)


@router.get("/{room_id}", response_model=RoomRead)
async def get_room(
    room_id: int, db: AsyncSession = Depends(get_db), _staff=Depends(get_current_staff)
) -> RoomRead:
    room = await room_crud.get_room(db, room_id)
    if room is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Quarto não encontrado")
    return room


@router.post("", response_model=RoomRead, status_code=status.HTTP_201_CREATED)
async def create_room(
    payload: RoomCreate, db: AsyncSession = Depends(get_db), _staff=Depends(staff_or_manager)
) -> RoomRead:
    return await room_crud.create_room(db, payload)


@router.patch("/{room_id}", response_model=RoomRead)
async def update_room(
    room_id: int,
    payload: RoomUpdate,
    db: AsyncSession = Depends(get_db),
    _staff=Depends(staff_or_manager),
) -> RoomRead:
    room = await room_crud.get_room(db, room_id)
    if room is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Quarto não encontrado")
    return await room_crud.update_room(db, room, payload)


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_room(
    room_id: int, db: AsyncSession = Depends(get_db), _staff=Depends(staff_or_manager)
) -> None:
    room = await room_crud.get_room(db, room_id)
    if room is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Quarto não encontrado")
    await room_crud.delete_room(db, room)
