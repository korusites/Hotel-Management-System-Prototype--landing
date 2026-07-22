
  # Hotel Management System Prototype

  Sistema de gestão hoteleira: front-end React (protótipo Figma Make original) integrado a uma API real em FastAPI + PostgreSQL, com dois serviços externos (sistema financeiro e backup automático) representando os `<<system>>` do diagrama de casos de uso do trabalho.

  ## Arquitetura

  - `src/` — front-end React/Vite/Tailwind. Landing page pública, fluxo de reserva/portal do hóspede e painel administrativo (staff), todos consumindo a API real (não há mais dados mockados).
  - `backend/` — API principal (FastAPI + PostgreSQL): quartos, hóspedes, reservas, funcionários, serviços adicionais, autenticação JWT, relatórios em CSV.
  - `finance-service/` — **Sistema Financeiro**, serviço externo separado (FastAPI + SQLite próprio) que registra uma fatura a cada reserva/cancelamento. O backend principal chama esse serviço por HTTP; se ele cair, a reserva continua funcionando normalmente (só a fatura não é registrada).
  - **Sistema de Backup**: serviço `prodrigestivill/postgres-backup-local` no `docker-compose.yml`, faz backup automático do Postgres a cada hora em `./backups/`.

  Detalhes de cada requisito (RF/RNF) atendido estão em `backend/README.md`.

  ## Rodando tudo

  1. `docker compose up -d --build` — sobe Postgres, API principal, sistema financeiro e serviço de backup.
  2. `docker compose exec api alembic upgrade head` — aplica as migrations.
  3. `docker compose exec api python seed.py` — popula o banco com dados de demonstração (senha do staff: `demo1234`).
  4. `npm i && npm run dev` — sobe o front-end em `http://localhost:5173`, já conversando com a API em `http://localhost:8000` (configurável via `.env` / `VITE_API_BASE_URL`).

  Swagger da API principal: `http://localhost:8000/docs`. Sistema financeiro isolado: `http://localhost:8001/docs`.

  ## Login de demonstração

  Painel staff: `ana.souza@hotel.com` / `demo1234` (administrador). Outras contas de exemplo em `backend/seed.py`.

  Portal do hóspede (`Minhas Reservas` / fluxo de reserva) não exige conta — basta o e-mail usado na reserva, como na maioria dos sites de hotel reais.
  