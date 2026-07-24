import pytest
from unittest.mock import AsyncMock, MagicMock
from app.crud.room import get_room, create_room
from app.schemas.room import RoomCreate

@pytest.mark.asyncio
async def test_get_room_by_id():
    # Agora usamos AsyncMock para suportar as chamadas com 'await'
    mock_db = AsyncMock()
    
    mock_room = MagicMock()
    mock_room.id = 1
    mock_room.number = "101"
    
    # Como o seu código real usa `await db.get()`, o mock fica super simples:
    mock_db.get.return_value = mock_room

    # Executamos a função
    result = await get_room(db=mock_db, room_id=1)

    # Asserções
    assert result.id == 1
    assert result.number == "101"
    
    # Podemos até verificar se o banco foi chamado corretamente com o ID 1
    mock_db.get.assert_awaited_once()

@pytest.mark.asyncio
async def test_create_room():
    mock_db = AsyncMock()
    
    # A CORREÇÃO: Forçamos o método 'add' a ser um Mock síncrono
    mock_db.add = MagicMock()
    
    room_in = RoomCreate(
        number="102",
        type="Luxo",
        price=250.0,
        floor=1,
        capacity=2
    )

    result = await create_room(mock_db, room_in)

    mock_db.add.assert_called_once()
    mock_db.commit.assert_awaited_once()
    
    assert result.number == "102"