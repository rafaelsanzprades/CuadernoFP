"""
Compara ciclos de todofp.es con la BD local.
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

print(f"{'='*60}")
print(f"COMPARISON: todofp.es vs BD")
print(f"{'='*60}")
print(f"todofp.es GM: {len(todofp['grado_medio'])} cycles")
print(f"todofp.es GS: {len(todofp['grado_superior'])} cycles")
print(f"BD total: {len(bd_degrees)} degrees")

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

print(f"\ntodofp unique center codes: {len(todofp_by_code)}")
print(f"BD unique codes: {len(bd_by_code)}")

# Encontrar coincidencias
matched = []
unmatched_bd = []
unmatched_todofp = []

for code, bd in bd_by_code.items():
    if code in todofp_by_code:
        matched.append({
            'code': code,
            'bd': bd,
            'todofp': todofp_by_code[code]
        })
    else:
        unmatched_bd.append(bd)

for code, cycles in todofp_by_code.items():
    if code not in bd_by_code:
        unmatched_todofp.extend(cycles)

print(f"\n{'='*60}")
print(f"RESULTS")
print(f"{'='*60}")
print(f"Matched: {len(matched)}")
print(f"In BD but not in todofp: {len(unmatched_bd)}")
print(f"In todofp but not in BD: {len(unmatched_todofp)}")

# Mostrar coincidencias
print(f"\nMatched cycles:")
for m in matched[:10]:
    bd = m['bd']
    tp = m['todofp'][0]
    print(f"  {m['code']}: {bd['name'][:40]:40} | {tp['title'][:40]:40} | {len(tp['boe_links'])} BOE")

# Mostrar no coincidentes de la BD
print(f"\nIn BD but not in todofp ({len(unmatched_bd)}):")
for d in unmatched_bd[:10]:
    print(f"  {d['code']}: {d['name'][:50]}")

# Mostrar no coincidentes de todofp
print(f"\nIn todofp but not in BD ({len(unmatched_todofp)}):")
for c in unmatched_todofp[:10]:
    print(f"  {c['center_code']}: {c['title'][:50]}")

# Guardar resultados
results = {
    'matched': matched,
    'unmatched_bd': unmatched_bd,
    'unmatched_todofp': unmatched_todofp
}

with open('temp_comparison.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"\nResults saved to temp_comparison.json")
