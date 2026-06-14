import json
import sys
import re
import os

backend_dir = r'c:\GD-rsp\APP\backend'
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from seed_fictitious_full_data import demo_pd_data_mock

ts_file = r'c:\GD-rsp\APP\frontend\src\services\demo-ele203-0237ictve-curso202526.ts'

with open(ts_file, 'r', encoding='utf-8') as f:
    content = f.read()

config_str = json.dumps(demo_pd_data_mock.get('config_contexto', {}), indent=6, ensure_ascii=False)
injection = f',\n    "config_contexto": {config_str}'

new_content = re.sub(r'("info_modulo": \{[^\}]+\}),', r'\g<1>' + injection + ',', content, count=1)

with open(ts_file, 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Injected into TS")
