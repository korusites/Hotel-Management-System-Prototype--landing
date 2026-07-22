# Grand Palácio Hotel API

Backend em FastAPI + PostgreSQL para o protótipo de gestão hoteleira. Modela as mesmas entidades do mock em `src/app/App.tsx`, com persistência real e regras de negócio (disponibilidade por data, cálculo de diárias, sincronização de status do quarto).

## Rodando localmente

```bash
docker compose up -d --build          # sobe Postgres + API
docker compose exec api alembic upgrade head
docker compose exec api python seed.py   # dados de demo; senha do staff: demo1234
```

Swagger UI: http://localhost:8000/docs

Para gerar uma nova migration depois de alterar um model em `app/models/`:

```bash
docker compose exec api alembic revision --autogenerate -m "descrição da mudança"
docker compose exec api alembic upgrade head
```

## Estrutura

- `app/models/` — SQLAlchemy ORM (Room, Guest, Reservation, StaffMember, Service)
- `app/schemas/` — Pydantic (validação de entrada/saída)
- `app/crud/` — acesso a dados e regras de negócio (disponibilidade, sincronização de status de quarto)
- `app/routers/` — endpoints HTTP, agrupados por recurso
- `app/deps.py` — autenticação JWT (`get_current_staff`) e checagem de papel (`require_role`)

## Autenticação e papéis

`StaffMember.role` tem 4 valores (`administrador`, `gerente`, `recepcionista`, `governanta`), usados tanto como cargo de exibição quanto como papel de autorização — é uma simplificação do mock, que tinha cargos livres (ex.: "Chef de Cozinha") sem relação direta com o sistema de permissões mostrado em "Configurações → Perfis de Acesso". Login em `POST /auth/login` retorna um JWT; rotas de staff exigem `Authorization: Bearer <token>`.

## Rotas públicas (sem login) — portal do hóspede

`GET/POST /guest-portal/*` não exigem autenticação, replicando o comportamento do protótipo ("qualquer e-mail funciona"). A única melhoria de segurança feita aqui em relação ao mock: cancelar uma reserva (`POST /guest-portal/reservations/{id}/cancel`) exige que o `guest_email` informado corresponda ao e-mail do hóspede da reserva. Isso não é autenticação real — não há verificação de posse do e-mail (senha, magic link, etc.). Antes de usar com dados reais de hóspedes, isso precisaria de um mecanismo de verificação mais forte.

## Fora de escopo (por decisão do usuário, por ora)

- Integração com o front-end React (`src/app/App.tsx`) — a API é testável isoladamente via Swagger/Postman.
- Testes automatizados.
