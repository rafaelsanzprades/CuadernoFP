import sqlite3
conn = sqlite3.connect('cdd_pro.db')
print(conn.execute("SELECT id_ra FROM learning_outcome_items WHERE module_document_id='0237-ictve-pd'").fetchall())
