from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, dashboard, guest_portal, guests, reservations, rooms, services, staff

app = FastAPI(title="Grand Palácio Hotel API", version="0.1.0")

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


@app.get("/health", tags=["health"])
async def health() -> dict:
    return {"status": "ok"}
