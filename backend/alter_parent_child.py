import sqlite3

db_path = 'cdd_pro.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

try:
    cur.execute("ALTER TABLE module_documents ADD COLUMN doc_type VARCHAR DEFAULT 'pd'")
    print("Added doc_type column.")
except sqlite3.OperationalError as e:
    print(f"Column doc_type might already exist: {e}")

try:
    cur.execute("ALTER TABLE module_documents ADD COLUMN parent_id VARCHAR REFERENCES module_documents(id)")
    print("Added parent_id column.")
except sqlite3.OperationalError as e:
    print(f"Column parent_id might already exist: {e}")

conn.commit()
conn.close()
print("ALTER DB complete.")
