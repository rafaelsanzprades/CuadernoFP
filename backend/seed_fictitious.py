import sys
import os
sys.stdout.reconfigure(encoding='utf-8')

# Ensure backend path
_backend_dir = os.path.dirname(os.path.abspath(__file__))
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from database import SessionLocal, engine, Base
from models import User

def seed_fake_teachers():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    teachers = [
        {"name": "Laura", "surname": "Martínez", "email": "laura.m@example.com"},
        {"name": "Carlos", "surname": "Gómez", "email": "carlos.g@example.com"},
        {"name": "Elena", "surname": "Rodríguez", "email": "elena.r@example.com"},
        {"name": "Javier", "surname": "López", "email": "javier.l@example.com"},
        {"name": "Ana", "surname": "Sánchez", "email": "ana.s@example.com"},
        {"name": "Miguel", "surname": "Fernández", "email": "miguel.f@example.com"},
        {"name": "Sofía", "surname": "Díaz", "email": "sofia.d@example.com"},
        {"name": "David", "surname": "Pérez", "email": "david.p@example.com"}
    ]

    for t in teachers:
        existing = db.query(User).filter_by(email=t["email"]).first()
        if not existing:
            new_user = User(name=t["name"], surname=t["surname"], email=t["email"])
            db.add(new_user)
    
    db.commit()
    db.close()
    print("Profesores ficticios añadidos.")

if __name__ == "__main__":
    seed_fake_teachers()
