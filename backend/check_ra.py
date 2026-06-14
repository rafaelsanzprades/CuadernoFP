import sqlite3
conn = sqlite3.connect('cdd_pro.db')
print(conn.execute("SELECT id_ud, ra_mappings FROM didactic_units WHERE module_document_id='0237-ictve-pd'").fetchall())
