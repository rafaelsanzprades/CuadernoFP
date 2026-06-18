"""Normalize all Degree names to CODE - Name format."""
from database import SessionLocal
from models import Degree

db = SessionLocal()
fixed = []
try:
    for d in db.query(Degree).all():
        if d.code and not d.name.startswith(d.code + " -"):
            old = d.name
            d.name = d.code + " - " + d.name
            fixed.append((d.id, old, d.name))
    db.commit()
    with open("fix_degree_names_log.txt", "w", encoding="utf-8") as f:
        for fid, old, new in fixed:
            f.write(f"id={fid}: {old} -> {new}\n")
        f.write(f"Total: {len(fixed)}\n")
    print(f"Done. {len(fixed)} degrees fixed. See fix_degree_names_log.txt")
except Exception as e:
    print(f"ERROR: {e}")
    db.rollback()
finally:
    db.close()
