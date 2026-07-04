from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import json
from pydantic import BaseModel
from database import get_db
from models import (
    Module, ProfessionalFamily, Degree, Center, LearningOutcome,
    ModuleDocument
)

router = APIRouter(prefix="/api", tags=["Catalogs"])


@router.get("/admin/modules")
def list_admin_modules(db: Session = Depends(get_db)):
    try:
        modules = db.query(Module).all()
        return {
            "status": "success",
            "data": [{"id": m.id, "code": m.code, "name": m.name} for m in modules]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class FamilyResponse(BaseModel):
    id: int
    code: str
    name: str
    icon_url: str | None = None
    color_hex: str | None = None
    degrees: list[dict]

    model_config = {"from_attributes": True}


@router.get("/families")
def list_families(db: Session = Depends(get_db)):
    try:
        # Get all families with their degrees
        families = db.query(ProfessionalFamily).all()
        result = []
        
        # Define level order for sorting
        level_order = {"BASICA": 1, "MEDIO": 2, "SUPERIOR": 3, "ESPECIALIZACION": 4}
        
        for f in families:
            degrees = db.query(Degree).filter(Degree.family_id == f.id, Degree.code.isnot(None)).order_by(Degree.level, Degree.code).all()
            
            # Determine the lowest level for this family (for sorting)
            lowest_level = 99
            if degrees:
                for d in degrees:
                    level_str = d.level.value if hasattr(d.level, 'value') else d.level
                    level_num = level_order.get(level_str, 99)
                    lowest_level = min(lowest_level, level_num)
            
            result.append({
                "id": f.id,
                "code": f.code,
                "name": f.name,
                "icon_url": f.icon_url,
                "color_hex": f.color_hex,
                "degrees": [{"id": d.id, "name": d.name, "code": d.code, "level": d.level.value if hasattr(d.level, 'value') else d.level, "boa_articles": d.boa_articles} for d in degrees],
                "_sort_level": lowest_level  # Internal field for sorting
            })
        
        # Sort families by lowest level first, then by code
        result.sort(key=lambda x: (x["_sort_level"], x["code"]))
        
        # Remove the internal sorting field
        for f in result:
            del f["_sort_level"]
        
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/modules")
def list_modules(db: Session = Depends(get_db)):
    try:
        docs = db.query(ModuleDocument.id).all()
        ids = [doc.id for doc in docs]

        pd_modules = [i for i in ids if i.endswith("-pd") or ("curso" not in i and i != "ciclos-fp")]
        curso_modules = [i for i in ids if "curso" in i]
        centro_modules = [i for i in ids if i == "ciclos-fp" or i.endswith("-centro")]

        return {
            "status": "success",
            "data": {
                "centro_modules": sorted(list(set(centro_modules))),
                "pd_modules": sorted(list(set(pd_modules))),
                "curso_modules": sorted(list(set(curso_modules)))
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/centers")
def list_centers(db: Session = Depends(get_db)):
    try:
        centers = db.query(Center).order_by(Center.name).all()
        return {
            "status": "success",
            "data": [{"id": c.id, "name": c.name, "titularity": c.titularity.value if hasattr(c.titularity, 'value') else c.titularity, "code": c.code} for c in centers]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/learning_outcomes")
def list_learning_outcomes(db: Session = Depends(get_db)):
    try:
        modules = db.query(Module).all()
        result = {}
        for m in modules:
            ras = db.query(LearningOutcome).filter(LearningOutcome.module_id == m.id).order_by(LearningOutcome.ra_number).all()
            if ras:
                result[m.code] = [{"raNumber": r.ra_number, "description": r.description} for r in ras]
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from models import EvaluationCriterion

@router.get("/catalog/curriculum/{degree_code}")
def get_curriculum(degree_code: str, db: Session = Depends(get_db)):
    try:
        degree = db.query(Degree).filter(Degree.code == degree_code).first()
        if not degree:
            raise HTTPException(status_code=404, detail="Degree not found")
            
        family = db.query(ProfessionalFamily).filter(ProfessionalFamily.id == degree.family_id).first()
        
        modules = db.query(Module).filter(Module.degree_id == degree.id).all()
        
        modulos_data = []
        for m in modules:
            ras = db.query(LearningOutcome).filter(LearningOutcome.module_id == m.id).order_by(LearningOutcome.ra_number).all()
            ra_data = []
            for ra in ras:
                ces = db.query(EvaluationCriterion).filter(EvaluationCriterion.learning_outcome_id == ra.id).all()
                ce_data = [{"id": ce.ce_code, "descripcion": ce.description} for ce in ces]
                ra_data.append({
                    "id": f"RA{ra.ra_number}.",
                    "descripcion": ra.description,
                    "ce": ce_data
                })
            
            # We now have 'curso' in the DB. Format as "1º", "2º", or "Ambos".
            curso_str = "1º"
            if m.curso:
                if "1" in str(m.curso) and "2" in str(m.curso):
                    curso_str = "Ambos"
                elif "2" in str(m.curso):
                    curso_str = "2º"
                    
            comp_data = []
            if m.convalidation_competences:
                try:
                    comp_data = json.loads(m.convalidation_competences)
                except:
                    pass

            modulos_data.append({
                "codigo": m.code,
                "nombre": m.name,
                "horas": m.hours,
                "curso": curso_str, 
                "ra": ra_data,
                "competencias": comp_data
            })
            
        return {
            "status": "success",
            "data": {
                "familia": family.name if family else "",
                "modulos": modulos_data,
                "boa_articles": degree.boa_articles
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/catalog/module/{module_code}")
def get_module_curriculum(module_code: str, db: Session = Depends(get_db)):
    try:
        module = db.query(Module).filter(Module.code == module_code).first()
        if not module:
            raise HTTPException(status_code=404, detail="Module not found")
            
        ras = db.query(LearningOutcome).filter(LearningOutcome.module_id == module.id).order_by(LearningOutcome.ra_number).all()
        ra_data = []
        for ra in ras:
            ces = db.query(EvaluationCriterion).filter(EvaluationCriterion.learning_outcome_id == ra.id).all()
            ce_data = [{"id": ce.ce_code, "descripcion": ce.description} for ce in ces]
            ra_data.append({
                "id": f"RA{ra.ra_number}.",
                "descripcion": ra.description,
                "ce": ce_data
            })
            
        curso_str = "1º"
        if module.curso:
            if "1" in str(module.curso) and "2" in str(module.curso):
                curso_str = "Ambos"
            elif "2" in str(module.curso):
                curso_str = "2º"
                
        comp_data = []
        if module.convalidation_competences:
            try:
                comp_data = json.loads(module.convalidation_competences)
            except:
                pass
                
        # Get degree code for OG/CPPS resolution
        degree_code = None
        if module.degree_id:
            degree = db.query(Degree).filter(Degree.id == module.degree_id).first()
            if degree:
                degree_code = degree.code

        return {
            "status": "success",
            "data": {
                "codigo": module.code,
                "nombre": module.name,
                "horas": module.hours,
                "curso": curso_str,
                "ra": ra_data,
                "competencias": comp_data,
                "degree_code": degree_code
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
