import sys
import os
import copy

backend_dir = r'c:\GD-rsp\APP\backend'
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from database import SessionLocal
from models import ModuleDocument
from services.module_service import update_module_data
from seed_fictitious_full_data import demo_pd_data_mock, demo_curso_data_mock

def restore_pd():
    db = SessionLocal()
    mod_id = '0237-ictve-pd'
    curso_id = '0237-ictve-curso-2025-26'
    
    doc = db.query(ModuleDocument).filter(ModuleDocument.id == mod_id).first()
    pd_version = doc.data.get('__version__', 1) if doc else 1
    
    doc_curso = db.query(ModuleDocument).filter(ModuleDocument.id == curso_id).first()
    curso_version = doc_curso.data.get('__version__', 1) if doc_curso else 1

    pd_mock = copy.deepcopy(demo_pd_data_mock)
    pd_mock['__version__'] = pd_version
    
    curso_mock = copy.deepcopy(demo_curso_data_mock)
    curso_mock['__version__'] = curso_version

    update_module_data(mod_id, pd_mock, db)
    db.commit()
    print('Restored 0237-ictve-pd with full demo_pd_data_mock!')

    update_module_data(curso_id, curso_mock, db)
    db.commit()
    print('Restored 0237-ictve-curso-2025-26 with full demo_curso_data_mock!')
    
    db.close()

if __name__ == '__main__':
    restore_pd()
