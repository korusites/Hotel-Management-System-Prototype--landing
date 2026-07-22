from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.limiter import limiter
from app.routers import (
    auth,
    dashboard,
    finance,
    guest_portal,
    guests,
    reports,
    reservations,
    rooms,
    services,
    staff,
    system,
)

app = FastAPI(title="Grand Palácio Hotel API", version="0.1.0")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(guests.router)
app.include_router(reservations.router)
app.include_router(staff.router)
app.include_router(services.router)
app.include_router(dashboard.router)
app.include_router(guest_portal.router)
app.include_router(finance.router)
app.include_router(reports.router)
app.include_router(system.router)


@app.get("/health", tags=["health"])
async def health() -> dict:
    return {"status": "ok"}
