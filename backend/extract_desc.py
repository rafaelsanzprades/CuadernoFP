import re
import json

with open('cdd_pro.db', 'rb') as f:
    data = f.read()

# Extract all printable string chunks longer than 50 chars
strings = re.findall(b'[\x20-\x7E]{50,}', data)
for s in strings:
    try:
        text = s.decode('utf-8')
        if '"desc_ud"' in text and '"id_ud"' in text:
            print(text[:300])
            print("---")
    except:
        pass
