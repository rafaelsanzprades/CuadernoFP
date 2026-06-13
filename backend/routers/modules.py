from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from services.module_service import get_module_data, update_module_data
from auth.dependencies import get_current_user
from models import User

router = APIRouter(prefix="/api/module", tags=["Modules"])

from schemas import ModuleUpdateBody


@router.get("/{module_id}")
def get_module(module_id: str, db: Session = Depends(get_db)):
    try:
        data = get_module_data(module_id, db)
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{module_id}")
def update_module(module_id: str, body: ModuleUpdateBody, db: Session = Depends(get_db)):
    # Local-First Architecture: The database is read-only for users.
    # User work should be persisted locally or in Google Drive.
    raise HTTPException(
        status_code=403, 
        detail="The server database is read-only (Local-First Architecture). User data must be saved locally."
    )
