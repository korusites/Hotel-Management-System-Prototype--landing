
  # Hotel Management System Prototype

  This is a code bundle for Hotel Management System Prototype. The original project is available at https://www.figma.com/design/idXkExsm0E1c53mHB2kxrx/Hotel-Management-System-Prototype.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Backend (API)

  O backend (FastAPI + PostgreSQL) vive em `backend/` e ainda não está integrado a este front-end — hoje ele só é testável isoladamente via Swagger.

  1. `docker compose up -d --build` — sobe Postgres + API
  2. `docker compose exec api alembic upgrade head` — aplica as migrations
  3. `docker compose exec api python seed.py` — popula o banco com os dados de demonstração (senha do staff: `demo1234`)
  4. Abra `http://localhost:8000/docs` para explorar e testar a API (Swagger)

  Detalhes de arquitetura e decisões em `backend/README.md`.
  