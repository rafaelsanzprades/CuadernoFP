import sqlite3

def add_password_column():
    conn = sqlite3.connect('cdd_pro.db')
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN password VARCHAR")
        conn.commit()
        print("Column 'password' added successfully.")
    except sqlite3.OperationalError as e:
        print(f"Error (maybe column already exists): {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    add_password_column()
