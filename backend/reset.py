from database import SessionLocal
from models import IncualFamilyData

db = SessionLocal()
empty_records = db.query(IncualFamilyData).filter(IncualFamilyData.scrape_status == 'complete').all()
count = 0
for r in empty_records:
    if len(r.ecp_nivel_1) == 0 and len(r.ecp_nivel_2) == 0 and len(r.ecp_nivel_3) == 0:
        r.scrape_status = 'pending'
        count += 1
db.commit()
db.close()
print(f'Reseteados {count} registros con 0 ECPs')
