import json
with open('frontend/public/demo/0237.fpp.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for k, v in data.items():
    if isinstance(v, list):
        print(f"{k} is a list of {len(v)} items.")
        if len(v) > 0:
            print(f"First item: {str(v[0])[:200]}")
    elif isinstance(v, dict):
        print(f"{k} is a dict with keys: {list(v.keys())}")
    else:
        print(f"{k}: {v}")
