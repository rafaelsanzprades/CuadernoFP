import json
import sqlite3

def check_db():
    conn = sqlite3.connect('cdd_pro.db')
    cursor = conn.cursor()
    row = cursor.execute("SELECT data FROM module_documents WHERE id='0237-ictve-pd'").fetchone()
    data = json.loads(row[0]) if row else {}
    print('df_ud' in data)
    
check_db()
