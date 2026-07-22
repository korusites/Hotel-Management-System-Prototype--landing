import csv
import io

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.crud import dashboard as dashboard_crud
from app.crud import guest as guest_crud
from app.crud import reservation as reservation_crud
from app.crud import room as room_crud
from app.crud import service as service_crud
from app.crud import staff as staff_crud
from app.deps import get_current_staff, require_role

router = APIRouter(prefix="/reports", tags=["reports"])

admin_or_manager = require_role("administrador", "gerente")


def _csv_response(rows: list[dict], filename: str) -> StreamingResponse:
    buffer = io.StringIO()
    if rows:
        writer = csv.DictWriter(buffer, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/rooms")
async def rooms_report(
    db: AsyncSession = Depends(get_db), _staff=Depends(get_current_staff)
) -> StreamingResponse:
    rooms = await room_crud.list_rooms(db)
    rows = [
        {
            "numero": r.number,
            "andar": r.floor,
            "tipo": r.type.value,
            "status": r.status.value,
            "capacidade": r.capacity,
            "preco_noite": float(r.price),
        }
        for r in rooms
    ]
    return _csv_response(rows, "relatorio-quartos.csv")


@router.get("/guests")
async def guests_report(
    db: AsyncSession = Depends(get_db), _staff=Depends(get_current_staff)
) -> StreamingResponse:
    guests = await guest_crud.list_guests(db)
    rows = []
    for g in guests:
        stays, last_stay = await guest_crud.get_guest_stats(db, g.id)
        rows.append(
            {
                "nome": g.name,
                "email": g.email,
                "telefone": g.phone,
                "cidade": g.city or "",
                "avaliacao": float(g.rating),
                "estadas": stays,
                "ultima_visita": last_stay.isoformat() if last_stay else "",
            }
        )
    return _csv_response(rows, "relatorio-hospedes.csv")


@router.get("/reservations")
async def reservations_report(
    db: AsyncSession = Depends(get_db), _staff=Depends(get_current_staff)
) -> StreamingResponse:
    reservations = await reservation_crud.list_reservations(db)
    rows = [
        {
            "codigo": r.code,
            "hospede": r.guest_name,
            "quarto": r.room_number,
            "tipo_quarto": r.room_type.value,
            "checkin": r.checkin.isoformat(),
            "checkout": r.checkout.isoformat(),
            "hospedes": r.guests,
            "status": r.status.value,
            "total": float(r.total),
        }
        for r in reservations
    ]
    return _csv_response(rows, "relatorio-reservas.csv")


@router.get("/financial")
async def financial_report(
    db: AsyncSession = Depends(get_db), _staff=Depends(get_current_staff)
) -> StreamingResponse:
    revenue = await dashboard_crud.get_monthly_revenue(db, months=12)
    rows = [{"mes": point["month"], "receita": point["receita"]} for point in revenue]
    return _csv_response(rows, "relatorio-financeiro.csv")


@router.get("/services")
async def services_report(
    db: AsyncSession = Depends(get_db), _staff=Depends(get_current_staff)
) -> StreamingResponse:
    services = await service_crud.list_services(db)
    usage = await service_crud.usage_counts(db)
    rows = [
        {
            "nome": s.name,
            "categoria": s.category,
            "preco": float(s.price),
            "unidade": s.unit,
            "disponivel": s.available,
            "usos": usage.get(s.id, 0),
        }
        for s in services
    ]
    return _csv_response(rows, "relatorio-servicos.csv")


@router.get("/staff")
async def staff_report(
    db: AsyncSession = Depends(get_db), _staff=Depends(admin_or_manager)
) -> StreamingResponse:
    staff = await staff_crud.list_staff(db)
    rows = [
        {
            "nome": s.name,
            "email": s.email,
            "telefone": s.phone or "",
            "papel": s.role.value,
            "departamento": s.department or "",
            "status": s.status.value,
            "desde": s.since.isoformat(),
        }
        for s in staff
    ]
    return _csv_response(rows, "relatorio-equipe.csv")
