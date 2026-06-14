import sys
import json
import copy

backend_dir = r'c:\GD-rsp\APP\backend'
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from database import SessionLocal
from services.module_service import update_module_data

ts_file = r'c:\GD-rsp\APP\frontend\src\services\demo-ele203-0237ictve-curso202526.ts'
with open(ts_file, 'r', encoding='utf-8') as f:
    text = f.read()
start = text.find('export const demoSeed = ') + len('export const demoSeed = ')
end = text.rfind(';')
data = json.loads(text[start:end].strip())

pd_mock = data.get('0237-ictve-pd')
curso_mock = data.get('0237-ictve-curso-2025-26')

db = SessionLocal()

# 1. Update PD
pd_copy = copy.deepcopy(pd_mock)
pd_copy['__version__'] = 15576 # bypass version
update_module_data('0237-ictve-pd', pd_copy, db)
db.commit()
print('Restored PD')

# 2. Update Curso, but provide the PD arrays so it doesn't wipe them!
curso_copy = copy.deepcopy(curso_mock)
for arr in ['df_ud', 'df_sesiones', 'df_ra', 'df_ce', 'df_act', 'df_pr', 'df_tareas', 'df_ace', 'df_dua', 'df_contingencia', 'df_feoe', 'df_sgmt']:
    curso_copy[arr] = copy.deepcopy(pd_mock.get(arr, []))

# also provide phase 3 dicts that belong to PD so they don't get wiped
for d in ['info_modulo', 'planning_ledger']:
    if d in pd_mock:
        curso_copy[d] = copy.deepcopy(pd_mock[d])

curso_copy['__version__'] = 15576
update_module_data('0237-ictve-curso-2025-26', curso_copy, db)
db.commit()
print('Restored Curso')

db.close()
