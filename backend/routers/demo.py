import json
import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import ModuleDocument

router = APIRouter(prefix="/api/demo", tags=["Demo"])

@router.post("/seed")
def seed_demo(db: Session = Depends(get_db)):
    try:
        seed_path = os.path.join(os.path.dirname(__file__), "..", "demo_seed.json")
        if not os.path.exists(seed_path):
            raise HTTPException(status_code=500, detail="Demo seed file not found")
        
        with open(seed_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        pd_data = data.get("0237-ictve-pd", {})
        curso_data = data.get("0237-ictve-curso-2025-26", {})
        
        # Save as demo-ictve-pd and demo-ictve-curso-2025-26
        pd_id = "demo-ictve-pd"
        curso_id = "demo-ictve-curso-2025-26"
        
        # Delete old if exists
        db.query(ModuleDocument).filter(ModuleDocument.id.in_([pd_id, curso_id])).delete(synchronize_session=False)
        
        pd_doc = ModuleDocument(id=pd_id, doc_type="pd", parent_id=None, data=pd_data)
        curso_doc = ModuleDocument(id=curso_id, doc_type="curso", parent_id=pd_id, data=curso_data)
        
        db.add(pd_doc)
        db.add(curso_doc)
        db.commit()
        
        return {
            "status": "success",
            "message": "Demo environment created successfully",
            "pd_id": pd_id,
            "curso_id": curso_id
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
