import json

files = ['frontend/public/demo/0237.fpp.json', 'frontend/public/demo/0223.fpp.json']

for file in files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        for ud in data.get('df_ud', []):
            if not ud.get('desc_ud'):
                ud_id = ud.get('id_ud', 'UD')
                ud['desc_ud'] = f'Título de demostración para la {ud_id}'
                
        with open(file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f'Updated {file}')
    except Exception as e:
        print(f'Error on {file}: {e}')
