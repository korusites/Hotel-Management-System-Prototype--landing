"""Popula o banco com os mesmos dados de demonstração usados no protótipo front-end.

Uso: docker compose exec api python seed.py
Pré-requisito: as migrations do Alembic já devem ter sido aplicadas.
"""

import asyncio
from datetime import date

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.guest import Guest
from app.models.reservation import Reservation, ReservationStatus
from app.models.reservation_service import ReservationService
from app.models.room import Room, RoomStatus, RoomType
from app.models.service import Service
from app.models.staff import StaffMember, StaffRole, StaffStatus

DEMO_PASSWORD = "demo1234"

ROOMS = [
    dict(number="101", floor=1, type=RoomType.standard, status=RoomStatus.ocupado, capacity=2, price=280,
         amenities=["Wi-Fi", "TV", "AC", "Frigobar"],
         img="https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop&auto=format"),
    dict(number="102", floor=1, type=RoomType.standard, status=RoomStatus.disponivel, capacity=2, price=280,
         amenities=["Wi-Fi", "TV", "AC", "Frigobar"],
         img="https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop&auto=format"),
    dict(number="103", floor=1, type=RoomType.standard, status=RoomStatus.reservado, capacity=2, price=280,
         amenities=["Wi-Fi", "TV", "AC", "Frigobar"],
         img="https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop&auto=format"),
    dict(number="104", floor=1, type=RoomType.standard, status=RoomStatus.disponivel, capacity=2, price=280,
         amenities=["Wi-Fi", "TV", "AC", "Frigobar"],
         img="https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop&auto=format"),
    dict(number="201", floor=2, type=RoomType.luxo, status=RoomStatus.ocupado, capacity=3, price=480,
         amenities=["Wi-Fi", "TV", "AC", "Banheira", "Varanda", "Frigobar"],
         img="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&auto=format"),
    dict(number="202", floor=2, type=RoomType.luxo, status=RoomStatus.disponivel, capacity=3, price=480,
         amenities=["Wi-Fi", "TV", "AC", "Banheira", "Varanda", "Frigobar"],
         img="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&auto=format"),
    dict(number="203", floor=2, type=RoomType.luxo, status=RoomStatus.manutencao, capacity=3, price=480,
         amenities=["Wi-Fi", "TV", "AC", "Banheira", "Varanda", "Frigobar"],
         img="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&auto=format"),
    dict(number="204", floor=2, type=RoomType.luxo, status=RoomStatus.reservado, capacity=3, price=480,
         amenities=["Wi-Fi", "TV", "AC", "Banheira", "Varanda"],
         img="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop&auto=format"),
    dict(number="301", floor=3, type=RoomType.suite, status=RoomStatus.ocupado, capacity=4, price=780,
         amenities=["Wi-Fi", "TV", "AC", "Banheira", "Varanda", "Sala", "Butler"],
         img="https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=600&h=400&fit=crop&auto=format"),
    dict(number="302", floor=3, type=RoomType.suite, status=RoomStatus.disponivel, capacity=4, price=780,
         amenities=["Wi-Fi", "TV", "AC", "Banheira", "Varanda", "Sala", "Butler"],
         img="https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=600&h=400&fit=crop&auto=format"),
    dict(number="303", floor=3, type=RoomType.suite, status=RoomStatus.ocupado, capacity=4, price=780,
         amenities=["Wi-Fi", "TV", "AC", "Banheira", "Varanda", "Sala"],
         img="https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=600&h=400&fit=crop&auto=format"),
    dict(number="401", floor=4, type=RoomType.presidencial, status=RoomStatus.disponivel, capacity=6, price=1850,
         amenities=["Wi-Fi", "TV", "AC", "Banheira", "Varanda", "Sala", "Cozinha", "Butler"],
         img="https://images.unsplash.com/photo-1711059985570-4c32ed12a12c?w=600&h=400&fit=crop&auto=format"),
]

GUESTS = [
    dict(name="Marcela Fonseca", email="marcela.fonseca@email.com", phone="(11) 99234-5678",
         cpf="123.456.789-00", city="São Paulo, SP", rating=5),
    dict(name="Roberto Henrique Castro", email="roberto.castro@email.com", phone="(21) 98765-4321",
         cpf="987.654.321-00", city="Rio de Janeiro, RJ", rating=4),
    dict(name="Juliana Martins", email="juliana.m@email.com", phone="(31) 97654-3210",
         cpf="456.789.123-00", city="Belo Horizonte, MG", rating=5),
    dict(name="Fernando Alves Neto", email="f.alves@email.com", phone="(41) 96543-2109",
         cpf="789.123.456-00", city="Curitiba, PR", rating=5),
    dict(name="Camila Rodrigues", email="camila.rod@email.com", phone="(51) 95432-1098",
         cpf="321.654.987-00", city="Porto Alegre, RS", rating=4),
    dict(name="Alexandre Vieira", email="a.vieira@email.com", phone="(11) 94321-0987",
         cpf="654.987.321-00", city="Campinas, SP", rating=3),
]

RESERVATIONS = [
    dict(code="RES-0241", guest="Marcela Fonseca", room="301", checkin=date(2025, 7, 20),
         checkout=date(2025, 7, 25), guests=2, status=ReservationStatus.confirmada, total=3900),
    dict(code="RES-0242", guest="Roberto Henrique Castro", room="201", checkin=date(2025, 7, 18),
         checkout=date(2025, 7, 22), guests=2, status=ReservationStatus.confirmada, total=1920),
    dict(code="RES-0243", guest="Juliana Martins", room="101", checkin=date(2025, 7, 15),
         checkout=date(2025, 7, 19), guests=1, status=ReservationStatus.checkout, total=1120),
    dict(code="RES-0244", guest="Fernando Alves Neto", room="401", checkin=date(2025, 7, 22),
         checkout=date(2025, 7, 28), guests=4, status=ReservationStatus.pendente, total=11100),
    dict(code="RES-0245", guest="Camila Rodrigues", room="204", checkin=date(2025, 7, 24),
         checkout=date(2025, 7, 27), guests=2, status=ReservationStatus.confirmada, total=1440),
    dict(code="RES-0246", guest="Alexandre Vieira", room="103", checkin=date(2025, 7, 19),
         checkout=date(2025, 7, 21), guests=1, status=ReservationStatus.cancelada, total=560),
    dict(code="RES-0247", guest="Marcela Fonseca", room="303", checkin=date(2025, 7, 10),
         checkout=date(2025, 7, 14), guests=2, status=ReservationStatus.checkout, total=3120),
]

STAFF = [
    dict(name="Ana Paula Souza", email="ana.souza@hotel.com", phone="(11) 3344-5566",
         role=StaffRole.administrador, department="Administração", status=StaffStatus.ativo,
         since=date(2019, 3, 1)),
    dict(name="Carlos Eduardo Lima", email="carlos.lima@hotel.com", phone="(11) 3344-5567",
         role=StaffRole.recepcionista, department="Recepção", status=StaffStatus.ativo,
         since=date(2021, 6, 15)),
    dict(name="Patrícia Gomes", email="patricia.gomes@hotel.com", phone="(11) 3344-5568",
         role=StaffRole.governanta, department="Housekeeping", status=StaffStatus.ativo,
         since=date(2020, 1, 10)),
    dict(name="Rodrigo Mendes", email="rodrigo.m@hotel.com", phone="(11) 3344-5569",
         role=StaffRole.gerente, department="Alimentos & Bebidas", status=StaffStatus.ativo,
         since=date(2022, 8, 20)),
    dict(name="Luciana Ferreira", email="luciana.f@hotel.com", phone="(11) 3344-5570",
         role=StaffRole.recepcionista, department="Recepção", status=StaffStatus.inativo,
         since=date(2020, 5, 1)),
]

SERVICES = [
    dict(name="Café da Manhã Premium", category="Alimentação", price=65, unit="por pessoa", available=True),
    dict(name="Spa & Massagem 60min", category="Bem-estar", price=220, unit="por sessão", available=True),
    dict(name="Transfer Aeroporto", category="Transporte", price=150, unit="por trajeto", available=True),
    dict(name="Lavanderia Express", category="Serviços", price=45, unit="por peça", available=True),
    dict(name="Baby Sitter", category="Bem-estar", price=80, unit="por hora", available=False),
    dict(name="Estacionamento Valet", category="Transporte", price=55, unit="por diária", available=True),
    dict(name="Late Checkout (até 16h)", category="Serviços", price=120, unit="por uso", available=True),
]

# Consumo de serviços já lançado em reservas existentes (alimenta o contador "used" real).
CONSUMPTIONS = [
    dict(reservation="RES-0241", service="Spa & Massagem 60min", quantity=2),
    dict(reservation="RES-0241", service="Café da Manhã Premium", quantity=5),
    dict(reservation="RES-0242", service="Transfer Aeroporto", quantity=1),
    dict(reservation="RES-0244", service="Estacionamento Valet", quantity=6),
    dict(reservation="RES-0245", service="Late Checkout (até 16h)", quantity=1),
    dict(reservation="RES-0247", service="Lavanderia Express", quantity=3),
]


async def main() -> None:
    async with SessionLocal() as db:
        rooms_by_number = {}
        for data in ROOMS:
            room = Room(**data)
            db.add(room)
            rooms_by_number[data["number"]] = room

        guests_by_name = {}
        for data in GUESTS:
            guest = Guest(**data)
            db.add(guest)
            guests_by_name[data["name"]] = guest

        for data in STAFF:
            db.add(StaffMember(**data, hashed_password=hash_password(DEMO_PASSWORD)))

        services_by_name = {}
        for data in SERVICES:
            service = Service(**data)
            db.add(service)
            services_by_name[data["name"]] = service

        await db.flush()

        reservations_by_code = {}
        for data in RESERVATIONS:
            reservation = Reservation(
                code=data["code"],
                guest_id=guests_by_name[data["guest"]].id,
                room_id=rooms_by_number[data["room"]].id,
                checkin=data["checkin"],
                checkout=data["checkout"],
                guests=data["guests"],
                status=data["status"],
                total=data["total"],
            )
            db.add(reservation)
            reservations_by_code[data["code"]] = reservation

        await db.flush()

        for data in CONSUMPTIONS:
            service = services_by_name[data["service"]]
            db.add(
                ReservationService(
                    reservation_id=reservations_by_code[data["reservation"]].id,
                    service_id=service.id,
                    quantity=data["quantity"],
                    unit_price=service.price,
                    created_at=reservations_by_code[data["reservation"]].checkin,
                )
            )

        await db.commit()

    print(f"Seed concluído. Senha de demonstração para todo o staff: {DEMO_PASSWORD}")


if __name__ == "__main__":
    asyncio.run(main())
