import sqlite3
import json
from database import engine, Base
from models import CalendarNoteItem
from sqlalchemy.orm import Session

# 1. Create table if not exists
Base.metadata.create_all(bind=engine)
print("Tables created/verified.")

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
        
    cal_notes = data.get("calendar_notes")
    if cal_notes and isinstance(cal_notes, dict):
        for k, v in cal_notes.items():
            # Avoid duplicates
            existing = session.query(CalendarNoteItem).filter_by(module_document_id=module_id, note_key=str(k)).first()
            if not existing:
                new_note = CalendarNoteItem(
                    module_document_id=module_id,
                    note_key=str(k),
                    note_text=str(v)
                )
                session.add(new_note)

session.commit()
session.close()
conn.close()

print("Migration of calendar_notes completed.")
