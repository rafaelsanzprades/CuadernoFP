import sys
import sqlite3
import os

# Adds backend to path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def migrate():
    print("Migrando Base de Datos para el Sprint B...")
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'cdd_pro.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Add region_id to degrees
    try:
        cursor.execute("ALTER TABLE degrees ADD COLUMN region_id INTEGER REFERENCES regions(id)")
        print(" -> Columna 'region_id' añadida a 'degrees'")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print(" -> Columna 'region_id' ya existe en 'degrees'")
        else:
            print(f"Error añadiendo region_id: {e}")
            
    # Asignar por defecto a Aragón (id=1 si existe, si no NULL)
    cursor.execute("UPDATE degrees SET region_id = 1 WHERE region_id IS NULL")
    
    # 2. Add ecp_code to learning_outcomes
    try:
        cursor.execute("ALTER TABLE learning_outcomes ADD COLUMN ecp_code VARCHAR")
        print(" -> Columna 'ecp_code' añadida a 'learning_outcomes'")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print(" -> Columna 'ecp_code' ya existe en 'learning_outcomes'")
        else:
            print(f"Error añadiendo ecp_code: {e}")
            
    conn.commit()
    conn.close()
    print("Migración completada.")

if __name__ == '__main__':
    migrate()
