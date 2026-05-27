import sqlite3
import json

db_path = 'cdd_pro.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Get the module
module_id = "0237-ictve-pd"
cur.execute("SELECT data FROM module_documents WHERE id = ?", (module_id,))
row = cur.fetchone()

if row:
    data = json.loads(row[0])
    data['calendar_notes'] = {
        "f_12/10/2026": "Día de la Hispanidad",
        "f_01/11/2026": "Día de Todos los Santos",
        "f_06/12/2026": "Día de la Constitución",
        "f_08/12/2026": "Inmaculada Concepción",
        "f_25/12/2026": "Navidad",
        "r_15/10/2026": "Reunión de departamento",
        "r_20/11/2026": "Examen Parcial 1"
    }
    cur.execute("UPDATE module_documents SET data = ? WHERE id = ?", (json.dumps(data), module_id))
    conn.commit()
    print("Updated calendar_notes successfully.")
else:
    print("Module not found.")

conn.close()
