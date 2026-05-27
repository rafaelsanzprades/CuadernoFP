from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services.module_service import get_module_data, update_module_data

router = APIRouter(prefix="/api/module", tags=["Modules"])

@router.get("/{module_id}")
def get_module(module_id: str, db: Session = Depends(get_db)):
    """
    Loads data from the SQLite database corresponding to the module.
    """
    try:
        data = get_module_data(module_id, db)
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{module_id}")
async def update_module(module_id: str, request: Request, db: Session = Depends(get_db)):
    """
    Saves data to the SQLite database corresponding to the module.
    """
    try:
        body = await request.json()
        update_module_data(module_id, body, db)
        return {"status": "success", "message": "Module updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
