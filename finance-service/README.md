# Sistema Financeiro (externo)

Serviço independente que simula um sistema financeiro de terceiros — realiza o `<<system>>` "Sistema Financeiro" do diagrama de casos de uso. Tem seu próprio armazenamento (SQLite, em `/data/finance.db` dentro do container) e não compartilha banco com a API principal do hotel (`backend/`).

A API principal (`backend/app/integrations/finance_client.py`) registra uma fatura aqui a cada reserva/cancelamento, via HTTP. Se este serviço estiver fora do ar, o cliente engole o erro e a reserva do hotel continua funcionando normalmente — só a fatura não é registrada.

## Rodando

Sobe junto com o resto via `docker compose up -d --build` (serviço `finance`, porta 8001).

Standalone: `uvicorn app:app --reload --port 8001` (requer `pip install -r requirements.txt`).

Swagger: http://localhost:8001/docs

## Endpoints

- `POST /invoices` — registra uma fatura (`reservation_code`, `guest_name`, `amount`, `kind`: `"reserva"` ou `"cancelamento"`)
- `GET /invoices` — lista todas as faturas
- `GET /invoices/{id}` — busca uma fatura
- `GET /health`
