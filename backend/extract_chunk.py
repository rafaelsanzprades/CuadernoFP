import re
import json

with open('cdd_pro.db', 'rb') as f:
    data = f.read()

# Let's search for "UD01" and "UD11"
ud01_pos = [m.start() for m in re.finditer(b'"UD01"', data)]

for pos in ud01_pos:
    chunk = data[max(0, pos-200):pos+4000].decode('utf-8', errors='ignore')
    if '"desc_ud"' in chunk and 'UD11' in chunk:
        print("FOUND FULL CHUNK!")
        with open('full_chunk.txt', 'w', encoding='utf-8') as out:
            out.write(chunk)
