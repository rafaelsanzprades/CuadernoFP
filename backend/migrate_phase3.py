import sqlite3
import json
from database import engine, Base
from models import ConfigDates, ScheduleItem, ModuleInfo, PlanningLedgerItem
from sqlalchemy.orm import Session

# 1. Create table if not exists
Base.metadata.create_all(bind=engine)
print("Phase 3 Tables created/verified.")

# 2. Migrate existing JSON
db_path = 'cdd_pro.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute("SELECT id, data FROM module_documents")
rows = cur.fetchall()

session = Session(bind=engine)

for row in rows:
    module_id = row[0]
    try:
        data = json.loads(row[1])
    except Exception:
        continue
        
    info_fechas = data.get("info_fechas")
    if info_fechas and isinstance(info_fechas, dict):
        if not session.query(ConfigDates).filter_by(module_document_id=module_id).first():
            session.add(ConfigDates(module_document_id=module_id, data=info_fechas))

    info_modulo = data.get("info_modulo")
    if info_modulo and isinstance(info_modulo, dict):
        if not session.query(ModuleInfo).filter_by(module_document_id=module_id).first():
            session.add(ModuleInfo(module_document_id=module_id, data=info_modulo))

    horario = data.get("horario")
    if horario and isinstance(horario, dict):
        for k, v in horario.items():
            if not session.query(ScheduleItem).filter_by(module_document_id=module_id, day_of_week=str(k)).first():
                session.add(ScheduleItem(module_document_id=module_id, day_of_week=str(k), hours=int(v) if str(v).isdigit() else 0))

    planning_ledger = data.get("planning_ledger")
    if planning_ledger and isinstance(planning_ledger, dict):
        for k, v in planning_ledger.items():
            if not session.query(PlanningLedgerItem).filter_by(module_document_id=module_id, date_str=str(k)).first():
                if isinstance(v, list):
                    for ud in v:
                        session.add(PlanningLedgerItem(module_document_id=module_id, date_str=str(k), id_ud=str(ud)))
                else:
                    session.add(PlanningLedgerItem(module_document_id=module_id, date_str=str(k), id_ud=str(v)))

session.commit()
session.close()
conn.close()

print("Migration of Phase 3 elements completed.")
