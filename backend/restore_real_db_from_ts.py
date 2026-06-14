import sys
import os
import json
import copy

backend_dir = r'c:\GD-rsp\APP\backend'
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from database import SessionLocal
from models import ModuleDocument
from services.module_service import update_module_data

ts_file = r'c:\GD-rsp\APP\frontend\src\services\demo-ele203-0237ictve-curso202526.ts'
with open(ts_file, 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('export const demoSeed = ') + len('export const demoSeed = ')
end = text.rfind(';')
json_str = text[start:end].strip()
data = json.loads(json_str)

pd_mock = data.get('0237-ictve-pd')
curso_mock = data.get('0237-ictve-curso-2025-26')

def restore_pd():
    db = SessionLocal()
    mod_id = '0237-ictve-pd'
    curso_id = '0237-ictve-curso-2025-26'
    
    doc = db.query(ModuleDocument).filter(ModuleDocument.id == mod_id).first()
    pd_version = doc.data.get('__version__', 1) if doc else 1
    
    doc_curso = db.query(ModuleDocument).filter(ModuleDocument.id == curso_id).first()
    curso_version = doc_curso.data.get('__version__', 1) if doc_curso else 1

    pd_mock_copy = copy.deepcopy(pd_mock)
    pd_mock_copy['__version__'] = pd_version
    
    curso_mock_copy = copy.deepcopy(curso_mock)
    curso_mock_copy['__version__'] = curso_version

    update_module_data(mod_id, pd_mock_copy, db)
    db.commit()
    print('Restored 0237-ictve-pd from TS file!')

    update_module_data(curso_id, curso_mock_copy, db)
    db.commit()
    print('Restored 0237-ictve-curso-2025-26 from TS file!')
    
    db.close()

if __name__ == '__main__':
    restore_pd()
