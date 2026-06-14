import sqlite3
conn = sqlite3.connect('cdd_pro.db')
rows = conn.execute("SELECT desc_ce FROM evaluation_criterion_items WHERE module_document_id='0237-ictve-pd' LIMIT 5").fetchall()
print([r[0] for r in rows])
