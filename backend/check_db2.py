import sqlite3
conn = sqlite3.connect('cdd_pro.db')
rows = conn.execute("SELECT id FROM module_documents WHERE data LIKE '%id_ud%'").fetchall()
print([r[0] for r in rows])
