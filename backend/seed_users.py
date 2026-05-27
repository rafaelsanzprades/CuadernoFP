import os
import sys

_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from database import SessionLocal
from models import User, Center, CenterStaff, Module, TeachingAssignment

def run():
    db = SessionLocal()
    try:
        print("Buscando módulos y centros...")
        # Get a center
        center = db.query(Center).first()
        if not center:
            print("No hay centros en la DB.")
            return

        # Get some modules
        modules = db.query(Module).limit(2).all()
        if len(modules) < 2:
            print("No hay suficientes módulos en la DB.")
            return

        module1 = modules[0]
        module2 = modules[1]

        # Prof 1
        prof1 = db.query(User).filter_by(email="profesor1@educa.aragon.es").first()
        if not prof1:
            prof1 = User(name="Profesor", surname="Uno", email="profesor1@educa.aragon.es", password="password", is_superadmin=False)
            db.add(prof1)
            db.commit()
            db.refresh(prof1)

        # Prof 2
        prof2 = db.query(User).filter_by(email="profesor2@educa.aragon.es").first()
        if not prof2:
            prof2 = User(name="Profesor", surname="Dos", email="profesor2@educa.aragon.es", password="password", is_superadmin=False)
            db.add(prof2)
            db.commit()
            db.refresh(prof2)

        # Superadmin
        admin = db.query(User).filter_by(email="admin@educa.aragon.es").first()
        if not admin:
            admin = User(name="Super", surname="Admin", email="admin@educa.aragon.es", password="password", is_superadmin=True)
            db.add(admin)
            db.commit()
            db.refresh(admin)

        # Assignments
        # Limpiar asig. antiguas
        db.query(TeachingAssignment).delete()

        db.add(TeachingAssignment(user_id=prof1.id, module_id=module1.id))
        db.add(TeachingAssignment(user_id=prof2.id, module_id=module2.id))

        db.commit()
        print("Usuarios creados con éxito.")
        print(f"Profesor 1: {prof1.email} -> Módulo asignado: {module1.code} ({module1.name})")
        print(f"Profesor 2: {prof2.email} -> Módulo asignado: {module2.code} ({module2.name})")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run()
