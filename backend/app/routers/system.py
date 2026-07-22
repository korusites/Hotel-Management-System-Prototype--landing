import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.deps import require_role

router = APIRouter(prefix="/system", tags=["system"])

admin_or_manager = require_role("administrador", "gerente")

BACKUPS_DIR = "/app/backups"


@router.get("/backups")
async def list_backups(_staff=Depends(admin_or_manager)) -> list[dict]:
    if not os.path.isdir(BACKUPS_DIR):
        return []
    entries = []
    for root, _dirs, files in os.walk(BACKUPS_DIR):
        for filename in files:
            path = os.path.join(root, filename)
            stat = os.stat(path)
            entries.append(
                {
                    "filename": filename,
                    "size_bytes": stat.st_size,
                    "created_at": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
                }
            )
    entries.sort(key=lambda e: e["created_at"], reverse=True)
    return entries
