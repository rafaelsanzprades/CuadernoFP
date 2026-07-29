import urllib.request
import json

req = urllib.request.urlopen('http://localhost:3000/api/catalog/module/0237')
data = json.loads(req.read())

ce_map = {}
for ra in data['data']['ra']:
    for ce in ra.get('ce', []):
        ce_map[ce['id']] = ce['descripcion']

print("CEs loaded:", len(ce_map))
print("Sample IDs:", list(ce_map.keys())[:5])

def get_desc(ce_id):
    if ce_id in ce_map:
        return ce_map[ce_id]
    
    parts = ce_id.split('.')
    if len(parts) == 2:
        suffix = parts[1]
        if suffix.isalpha():
            num = ord(suffix.lower()) - 96
            num_ce_id = f"{parts[0]}.{num}"
            print(f"Converted {ce_id} to {num_ce_id}")
            if num_ce_id in ce_map:
                return ce_map[num_ce_id]
    return None

print("Result for CE1.a:", get_desc("CE1.a"))
