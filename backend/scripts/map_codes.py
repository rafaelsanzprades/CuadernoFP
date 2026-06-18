"""
Mapeo de códigos todofp.es -> BD.
Los códigos de todofp son códigos de centro (4 dígitos).
Los códigos de la BD son códigos de familia + número.
"""
import json
import sqlite3

# Cargar datos de todofp
with open('temp_todofp_all.json', 'r', encoding='utf-8') as f:
    todofp = json.load(f)

# Cargar datos de la BD
conn = sqlite3.connect('cdd_pro.db')
c = conn.cursor()
c.execute('SELECT id, code, name, level, family_id FROM degrees ORDER BY code')
bd_degrees = []
for row in c.fetchall():
    bd_degrees.append({
        'id': row[0],
        'code': row[1],
        'name': row[2],
        'level': row[3],
        'family_id': row[4]
    })
conn.close()

# Crear índice de la BD por código
bd_by_code = {}
for d in bd_degrees:
    if d['code']:
        bd_by_code[d['code']] = d

# Crear índice de todofp por código de centro
todofp_by_code = {}
for cycle in todofp['grado_medio'] + todofp['grado_superior']:
    code = cycle.get('center_code')
    if code:
        if code not in todofp_by_code:
            todofp_by_code[code] = []
        todofp_by_code[code].append(cycle)

print(f"{'='*60}")
print(f"CODE MAPPING ANALYSIS")
print(f"{'='*60}")

# Analizar códigos de la BD
print(f"\nBD codes (first 20):")
for code in sorted(bd_by_code.keys())[:20]:
    d = bd_by_code[code]
    print(f"  {code}: {d['name'][:50]}")

# Analizar códigos de todofp
print(f"\ntodofp codes (first 20):")
for code in sorted(todofp_by_code.keys())[:20]:
    cycles = todofp_by_code[code]
    print(f"  {code}: {cycles[0]['title'][:50]} ({len(cycles)} cycles)")

# Buscar patrones
print(f"\n{'='*60}")
print(f"PATTERN ANALYSIS")
print(f"{'='*60}")

# Los códigos de la BD parecen ser: [FAMILIA][NIVEL][NÚMERO]
# Ejemplo: ADG201 = ADG (Administración y Gestión) + 2 (GM) + 01
# Los códigos de todofp son: [NÚMERO] (código de centro)

# Vamos a intentar mapear por nombre
print(f"\nAttempting name-based mapping...")
matched_by_name = []
unmatched_bd = []

for bd_code, bd in bd_by_code.items():
    found = False
    for tp_code, tp_cycles in todofp_by_code.items():
        for tp in tp_cycles:
            # Normalizar nombres para comparar
            bd_name_norm = bd['name'].lower().strip()
            tp_name_norm = tp['title'].lower().replace('técnico en ', '').replace('técnico superior en ', '').strip()
            
            if bd_name_norm in tp_name_norm or tp_name_norm in bd_name_norm:
                matched_by_name.append({
                    'bd_code': bd_code,
                    'tp_code': tp_code,
                    'bd_name': bd['name'],
                    'tp_name': tp['title'],
                    'boe_links': tp['boe_links']
                })
                found = True
                break
        if found:
            break
    
    if not found:
        unmatched_bd.append(bd)

print(f"Matched by name: {len(matched_by_name)}")
print(f"Unmatched BD: {len(unmatched_bd)}")

# Mostrar coincidencias
print(f"\nMatched by name (first 10):")
for m in matched_by_name[:10]:
    print(f"  {m['bd_code']:10} -> {m['tp_code']:10} | {m['bd_name'][:30]:30} | {m['tp_name'][:30]:30} | {len(m['boe_links'])} BOE")

# Mostrar no coincidentes
print(f"\nUnmatched BD (first 10):")
for d in unmatched_bd[:10]:
    print(f"  {d['code']}: {d['name'][:50]}")

# Guardar mapeo
mapping = {
    'matched': matched_by_name,
    'unmatched_bd': unmatched_bd
}

with open('temp_code_mapping.json', 'w', encoding='utf-8') as f:
    json.dump(mapping, f, ensure_ascii=False, indent=2)

print(f"\nMapping saved to temp_code_mapping.json")
