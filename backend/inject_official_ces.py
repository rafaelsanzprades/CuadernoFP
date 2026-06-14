import sqlite3
import re
import json

def read_ts():
    with open('c:\\GD-rsp\\APP\\frontend\\src\\data\\curriculos\\ele203.ts', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to extract the module with codigo: "0237"
    # It's a huge JS object, so we'll use regex to parse it.
    
    # Let's find the start of the 0237 module
    idx = content.find('codigo: "0237"')
    if idx == -1:
        print("Not found")
        return
        
    sub = content[idx:]
    
    # Extract RAs block
    ra_matches = re.finditer(r'id:\s*"RA0?(\d)"\s*,\s*descripcion:\s*"(.*?)"\s*,\s*criterios_evaluacion:\s*\[(.*?)\]', sub, re.DOTALL)
    
    conn = sqlite3.connect('cdd_pro.db')
    cursor = conn.cursor()
    
    # Delete old CEs for 0237-ictve-pd
    cursor.execute("DELETE FROM evaluation_criterion_items WHERE module_document_id='0237-ictve-pd'")
    
    letters = 'abcdefghijklmnopqrstuvwxyz'
    count = 0
    
    for ra_match in ra_matches:
        ra_num = ra_match.group(1) # e.g. "1"
        ra_id = f"RA{ra_num}"
        ces_str = ra_match.group(3)
        
        # Extract CEs inside this RA
        ce_matches = re.findall(r'id:\s*"CE\d+"\s*,\s*descripcion:\s*"(.*?)"', ces_str)
        
        # Calculate uniform weight
        if len(ce_matches) > 0:
            weight = round(100.0 / len(ce_matches), 1)
        else:
            weight = 0
            
        for i, ce_desc in enumerate(ce_matches):
            ce_id = f"CE{ra_num}.{letters[i]}"
            
            # Default ID UD = UD01
            data = {"feoe": False, "cpe_vinc": "", "og_vinc": ""}
            
            cursor.execute("""
                INSERT INTO evaluation_criterion_items 
                (module_document_id, id_ce, id_ra, id_ud, desc_ce, peso_ce, data) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                "0237-ictve-pd",
                ce_id,
                ra_id,
                "UD01",
                ce_desc,
                str(weight),
                json.dumps(data)
            ))
            count += 1
            
        if ra_id == "RA7": # We reached the last RA for 0237
            break

    conn.commit()
    print(f"Injected {count} official CEs for 0237!")

read_ts()
