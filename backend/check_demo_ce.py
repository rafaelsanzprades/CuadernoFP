import sqlite3
conn = sqlite3.connect('cdd_pro.db')
print(conn.execute("SELECT desc_ce FROM evaluation_criterion_items WHERE module_document_id='demo-ictve-pd' LIMIT 5").fetchall())
