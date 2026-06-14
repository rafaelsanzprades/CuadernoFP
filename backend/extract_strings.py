import re
import json

with open('cdd_pro.db', 'rb') as f:
    data = f.read()

# Let's find all occurrences of "id_ud"
offsets = [m.start() for m in re.finditer(b'"id_ud"', data)]

for off in offsets:
    # Try to extract a window of 5000 bytes around it
    start = max(0, off - 2000)
    end = min(len(data), off + 8000)
    chunk = data[start:end].decode('utf-8', errors='ignore')
    
    if "UD12" in chunk: # Assuming there were ~12 UDs
        print("Found a chunk with UD12!")
        with open('chunk.txt', 'w', encoding='utf-8') as out:
            out.write(chunk)
        break
