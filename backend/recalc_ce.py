import sqlite3
import json

conn = sqlite3.connect('cdd_pro.db')
cursor = conn.cursor()

cursor.execute("SELECT module_document_id, id_ra FROM evaluation_criterion_items GROUP BY module_document_id, id_ra")
ras = cursor.fetchall()

updated = 0
for module_id, id_ra in ras:
    cursor.execute("SELECT id FROM evaluation_criterion_items WHERE module_document_id = ? AND id_ra = ? ORDER BY id_ce", (module_id, id_ra))
    ces = cursor.fetchall()
    
    count = len(ces)
    if count > 0:
        share = round(100.0 / count, 1)
        for ce in ces:
            ce_id = ce[0]
            cursor.execute("UPDATE evaluation_criterion_items SET peso_ce = ? WHERE id = ?", (str(share), ce_id))
            updated += 1

conn.commit()
conn.close()
print(f"Updated {updated} CE rows.")
