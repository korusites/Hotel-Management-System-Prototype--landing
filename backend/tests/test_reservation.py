from fastapi.testclient import TestClient
from app.main import app

# Cliente de teste do FastAPI
client = TestClient(app)

def test_create_reservation_success(mocker):
    # 1. Configurando o Mock
    # Substituímos a função real 'create_reservation' do arquivo crud por um objeto falso (mock)
    mock_create = mocker.patch("app.crud.reservation.create_reservation")
    
    # 2. Definindo o retorno esperado do Mock
    mock_create.return_value = {"id": 1, "guest_id": 123, "status": "confirmed"}

    # 3. Executando a ação (chamando a API)
    payload = {"guest_id": 123, "room_id": 10, "days": 3}
    response = client.post("/reservations/", json=payload)

    # 4. Asserções (Validações de Caixa Branca)
    assert response.status_code == 200
    assert response.json()["status"] == "confirmed"
    
    # Garantindo que o mock foi chamado com os parâmetros corretos
    mock_create.assert_called_once()