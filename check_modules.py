# -*- coding: utf-8 -*-
import re

def check_file(fname):
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    idx = content.find('"modulos"')
    if idx < 0:
        idx = content.find('modulos')
    if idx < 0:
        print(f"  ERROR: 'modulos' not found in {fname}")
        return
    
    mod_section = content[idx:]
    
    # Find all module-level "codigo" (not UF codes)
    # Modules have codes like 0237, UF have codes like UF0237_12
    # Strategy: find all "codigo": "XXXX" where XXXX is 4 digits
    positions = []
    for m in re.finditer(r'"codigo":\s*"(\d{4})"', mod_section):
        positions.append((m.start(), m.group(1)))
    
    print(f"\n=== {fname} ===")
    print(f"  Found {len(positions)} modules (4-digit codes)")
    
    missing = []
    ok = []
    
    for i, (pos, code) in enumerate(positions):
        end = positions[i+1][0] if i+1 < len(positions) else len(mod_section)
        chunk = mod_section[pos:end]
        
        name_match = re.search(r'"nombre":\s*"([^"]+)"', chunk)
        name = name_match.group(1) if name_match else '?'
        
        ra_matches = re.findall(r'"id":\s*"RA(\d+)"', chunk)
        ce_matches = re.findall(r'"id":\s*"CE(\d+)\.(\d+)"', chunk)
        
        ra_count = len(ra_matches)
        ce_count = len(ce_matches)
        
        if ra_count == 0:
            missing.append((code, name))
            print(f"  *** MISSING RA *** {code}: {name}")
        else:
            ok.append((code, name, ra_count, ce_count))
    
    print(f"\n  SUMMARY: {len(ok)} OK, {len(missing)} MISSING RA")
    if missing:
        print(f"  Missing modules:")
        for code, name in missing:
            print(f"    - {code}: {name}")

check_file('frontend/src/data/curriculos/ele203.ts')
check_file('frontend/src/data/curriculos/ele304.ts')
