import sys
import traceback
sys.path.append("c:\\GD-rsp\\APP\\backend")
from database import SessionLocal, ModuleDocument
from pdf_calendario_academico import generar_pdf_calendario

db = SessionLocal()
doc_pd = db.query(ModuleDocument).filter(ModuleDocument.id == "0237-ictve-pd").first()
doc_curso = db.query(ModuleDocument).filter(ModuleDocument.id == "0237-ictve-curso-2025-26").first()

module_data = doc_pd.data if doc_pd else {}
info_modulo = module_data.get("info_modulo", {})

from datetime import datetime
info_fechas_raw = module_data.get("info_fechas", {})
info_fechas = {}
for k, v in info_fechas_raw.items():
    if isinstance(v, str) and v.strip():
        try:
            info_fechas[k] = datetime.fromisoformat(v.replace("Z", "+00:00")[:10]).date()
        except Exception:
            info_fechas[k] = v
    else:
        info_fechas[k] = v

horario = module_data.get("horario", {})
planning_ledger = module_data.get("planning_ledger", {})
calendar_notes = module_data.get("calendar_notes", {})

try:
    buffer = generar_pdf_calendario(info_modulo, info_fechas, planning_ledger, calendar_notes)
    print("SUCCESS!")
except Exception as e:
    traceback.print_exc()
