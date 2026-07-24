# Grand Palácio Hotel API

Backend em FastAPI + PostgreSQL para o sistema de gestão hoteleira. Modela as entidades do front-end (`src/app/`), com persistência real, regras de negócio (disponibilidade por data, cálculo de diárias, sincronização de status do quarto) e integração real com dois sistemas externos.

## Rodando localmente

```bash
docker compose up -d --build          # sobe Postgres + API + sistema financeiro + backup
docker compose exec api alembic upgrade head
docker compose exec api python seed.py   # dados de demo; senha do staff: demo1234
```

Swagger UI: http://localhost:8000/docs

Para gerar uma nova migration depois de alterar um model em `app/models/`:

```bash
docker compose exec api alembic revision --autogenerate -m "descrição da mudança"
docker compose exec api alembic upgrade head
```

## Variáveis de ambiente (`app/core/config.py`)

| Variável | Padrão (dev local) | Em produção (Render) |
|---|---|---|
| `DATABASE_URL` | `postgresql+asyncpg://hotel:hotel@db:5432/hotel` | connection string do Neon (mesmo formato, com `+asyncpg`) |
| `JWT_SECRET` | valor de exemplo, não seguro | gerado automaticamente pelo `render.yaml` |
| `FINANCE_SERVICE_URL` | `http://finance:8001` (nome do serviço no docker-compose) | URL pública do serviço `hotel-finance` no Render |
| `CORS_ORIGINS` | `*` (qualquer origem, ok para dev local) | URL do front na Vercel (ex.: `https://seu-projeto.vercel.app`) |

Detalhes completos de como hospedar tudo isso de graça (Vercel + Render + Neon + GitHub Actions) estão no `README.md` da raiz do projeto.

## Estrutura

- `app/models/` — SQLAlchemy ORM (Room, Guest, Reservation, ReservationService, StaffMember, Service)
- `app/schemas/` — Pydantic (validação de entrada/saída)
- `app/crud/` — acesso a dados e regras de negócio (disponibilidade, sincronização de status de quarto, agregação de uso de serviços)
- `app/routers/` — endpoints HTTP, agrupados por recurso
- `app/deps.py` — autenticação JWT (`get_current_staff`) e checagem de papel (`require_role`)
- `app/integrations/finance_client.py` — cliente HTTP para o sistema financeiro externo (`finance-service/`)
- `app/core/limiter.py` — rate limiting (slowapi) usado em `/auth/login`

## Requisitos do trabalho → onde estão implementados

| Requisito | Onde |
|---|---|
| RF01 Cadastro de quartos | `routers/rooms.py` (CRUD completo, front em `staff/views/RoomsView.tsx`) |
| RF02 Cadastro de hóspedes | `routers/guests.py` (front em `GuestsView.tsx`, CPF mascarado por padrão na edição — RNF07) |
| RF03 Cadastro de funcionários | `routers/staff.py` (só administrador cria/edita/exclui) |
| RF04 Reservas e Cancelamento | `routers/guest_portal.py` (hóspede) e `routers/reservations.py` (staff) |
| RF05 Controle financeiro | `routers/dashboard.py` (receita) + `routers/finance.py`, que expõe as faturas registradas no **Sistema Financeiro externo** (`finance-service/`) |
| RF06 Histórico de Reservas | `GET /reservations` (com filtro por status) e estatísticas por hóspede em `GET /guests` |
| RF07 Pesquisa de Disponibilidade | `GET /rooms/availability` (pública, sem login) |
| RF08 Emissão de Relatórios | `routers/reports.py` — 6 relatórios reais em CSV (quartos, hóspedes, reservas, financeiro, serviços, equipe) |
| RF09 Controle de Serviços Adicionais | `models/reservation_service.py` + `POST/GET/DELETE /reservations/{id}/services` — consumo vinculado à reserva; contador "usado" em `Service` é sempre calculado por agregação, não é mais um número fixo |
| RF10 Autenticação de Usuários | `POST /auth/login` (JWT) para staff; hóspede se identifica por e-mail (decisão de produto — sem conta/senha, como a maioria dos sites de hotel) |

| Não funcional | Onde |
|---|---|
| RNF01 Disponibilidade | `restart: unless-stopped` em todos os serviços do `docker-compose.yml`; healthcheck real da API em `GET /health` |
| RNF02 Segurança | senha com bcrypt, JWT, autorização por papel, rate limit de `5/minuto` em `/auth/login` (`core/limiter.py`) |
| RNF03 Escalabilidade | stack assíncrona (FastAPI + SQLAlchemy async), API sem estado (JWT) |
| RNF04 Desempenho | limite de página (`limit`, máx. 500) em `/guests`, `/reservations`, `/staff` |
| RNF07 Conformidade com LGPD | CPF mascarado por padrão no formulário de edição do hóspede (revelar sob demanda) |
| RNF09 Backup e Recuperação | serviço `prodrigestivill/postgres-backup-local` no `docker-compose.yml` (backup automático a cada hora); `GET /system/backups` expõe o status real, consumido em `ConfigView.tsx`. Na versão hospedada, `.github/workflows/backup.yml` cumpre o mesmo papel (backup diário agendado contra o Neon) |

RNF05/06/08/10 não exigiram código novo — já cobertos pela arquitetura (stack web padrão, código modular, validação via Pydantic, UI responsiva).

## Sistema Financeiro externo (`finance-service/`)

Serviço separado, com banco próprio (SQLite), simulando um sistema financeiro de terceiros — realiza o `<<system>>` "Sistema Financeiro" do diagrama de casos de uso. O backend principal chama `POST /invoices` nele a cada reserva/cancelamento (`app/integrations/finance_client.py`), via HTTP, na porta 8001. Se o serviço estiver fora do ar, a chamada falha silenciosamente (timeout curto) e a reserva **não é bloqueada** — só a fatura deixa de ser registrada. Testado explicitamente: derrubar o container `finance` não impede `POST /guest-portal/bookings`.

## Autenticação e papéis

`StaffMember.role` tem 4 valores (`administrador`, `gerente`, `recepcionista`, `governanta`), usados tanto como cargo de exibição quanto como papel de autorização. Login em `POST /auth/login` retorna um JWT (limitado a 5 tentativas/minuto por IP); rotas de staff exigem `Authorization: Bearer <token>`.

## Rotas públicas (sem login) — portal do hóspede

`GET/POST /guest-portal/*` não exigem autenticação — decisão confirmada de produto: o e-mail informado na reserva já serve como identificação do hóspede, sem conta/senha. Cancelar uma reserva (`POST /guest-portal/reservations/{id}/cancel`) exige que o `guest_email` informado corresponda ao e-mail do hóspede da reserva; isso não é autenticação forte (sem verificação de posse do e-mail) — suficiente para este protótipo, mas precisaria de um mecanismo mais robusto antes de usar com dados reais de hóspedes.

## Testes de caixa cinza (`tests/`)

Rodam contra a stack real (containers já no ar), batendo na API principal, no sistema financeiro externo e no Postgres — sem importar nem mockar nada de `app/`. Cada teste usa algum conhecimento da arquitetura interna (que existem dois serviços, que o rate limit é 5/minuto, que a transição de status só ocorre na leitura) para escolher o caso certo, mas a verificação em si é sempre pela borda do sistema:

```bash
docker compose up -d --build
docker compose exec api alembic upgrade head
pip install -r backend/requirements-dev.txt
pytest backend/tests -v
```

`CG-02` para e reinicia o container `finance` durante o teste (para provar que a reserva não é bloqueada com o sistema financeiro fora do ar) — por isso os testes rodam na máquina host, não dentro de um container.

## Fora de escopo

- Encriptação em repouso do CPF no banco (hoje é texto puro na coluna, protegido só por controle de acesso e mascaramento na UI).
- Telas de Configurações (segurança, dados do hotel, perfis de acesso) e Relatórios de escala de equipe permanecem ilustrativas — não há entidade de "configurações" no backend.
