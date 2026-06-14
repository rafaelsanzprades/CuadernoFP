import sqlite3
conn = sqlite3.connect('cdd_pro.db')
print(len(conn.execute("SELECT * FROM evaluation_criterion_items WHERE module_document_id='0237-ictve-pd'").fetchall()))
