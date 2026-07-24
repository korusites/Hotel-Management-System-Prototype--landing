
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

  ## Hospedagem gratuita (Vercel + Render + Neon + GitHub Actions)

  A mesma arquitetura de 4 peças roda hospedada, sem custo:

  | Peça | Onde |
  |---|---|
  | Front-end (`src/`) | [Vercel](https://vercel.com) — detecta o projeto Vite automaticamente |
  | API principal (`backend/`) | [Render](https://render.com) — free Web Service via Docker (`render.yaml`) |
  | Sistema Financeiro (`finance-service/`) | [Render](https://render.com) — outro free Web Service via Docker |
  | Banco de dados | [Neon](https://neon.tech) — Postgres serverless gratuito, substitui o Postgres do `docker-compose` |
  | Backup automático | `.github/workflows/backup.yml` — `pg_dump` agendado contra o Neon, publicado como artifact do GitHub Actions (equivalente gratuito ao container de backup local, que exige um Postgres próprio via Docker) |

  **Passo a passo:**
  1. Criar um projeto no [Neon](https://neon.tech) e copiar a connection string.
  2. Rodar as migrations e o seed contra o Neon (`alembic upgrade head` e `python seed.py` com `DATABASE_URL` apontando pra lá).
  3. No [Render](https://render.com): **New Blueprint** → conectar este repositório → ele lê o `render.yaml` e cria os serviços `hotel-api` e `hotel-finance` → preencher no painel: `DATABASE_URL` (Neon), `FINANCE_SERVICE_URL` (URL pública do `hotel-finance`, depois de criado) e `CORS_ORIGINS` (preenchido no passo 4).
  4. Na [Vercel](https://vercel.com): importar o repositório → definir a env var `VITE_API_BASE_URL` com a URL pública do `hotel-api` → deploy.
  5. Voltar no Render e preencher `CORS_ORIGINS` do `hotel-api` com a URL da Vercel → redeploy.
  6. No GitHub do repositório: **Settings → Secrets and variables → Actions** → adicionar o secret `DATABASE_URL` com a connection string "crua" do Neon (formato `postgresql://...`, sem o `+asyncpg`) para o workflow de backup funcionar.

  **Limitação conhecida do free tier**: o `hotel-finance` no Render não tem disco persistente — o SQLite de faturas/pagamentos reseta a cada novo deploy (não a cada período de inatividade). Localmente, via `docker-compose`, ele persiste normalmente num volume nomeado.
  