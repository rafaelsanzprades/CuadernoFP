"""Test scraper v2: extraer OG de BOE-A-2019-18090 (ELE203)"""
import urllib.request
import re
import json

BOE_ID = "BOE-A-2019-18090"
URL = f"https://www.boe.es/diario_boe/xml.php?id={BOE_ID}"

def main():
    print(f"Downloading BOE XML: {BOE_ID}")
    req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
    response = urllib.request.urlopen(req, timeout=60)
    raw = response.read()
    
    # Decode - BOE XML is UTF-8
    text = raw.decode("utf-8", errors="replace")
    print(f"Raw XML: {len(text)} chars")
    
    # Strip HTML tags
    clean = re.sub(r"<[^>]+>", " ", text)
    clean = re.sub(r"\s+", " ", clean).strip()
    print(f"Clean text: {len(clean)} chars")
    
    # Save full clean text
    with open("temp_ele203_full.txt", "w", encoding="utf-8") as f:
        f.write(clean)
    
    # The BOE structure for FP currículos is:
    # - Art 1-5: General provisions
    # - Anexo I: Module details (Objetivos, Contenidos, RA, CE for each module)
    # - Anexo II: Maybe more
    
    # Let's find ALL "Objetivos" occurrences (case insensitive)
    obj_matches = list(re.finditer(r"[Oo]bjetivos", clean))
    print(f"\nFound {len(obj_matches)} 'Objetivos' occurrences")
    
    # Find module code patterns like "Codigo: XXXX" or "Código: XXXX"
    code_matches = list(re.finditer(r"[Cc][oó]digo:\s*(\d+)", clean))
    print(f"Found {len(code_matches)} module codes: {[m.group(1) for m in code_matches]}")
    
    # Find "Módulo Profesional" or "Modulo Profesional"  
    mod_matches = list(re.finditer(r"[Mm][oó]dulo [Pp]rofesional", clean))
    print(f"Found {len(mod_matches)} 'Modulo Profesional' occurrences")
    
    # Let's look at the structure around each module
    # Write a section of text around each module code
    output = []
    for i, code_match in enumerate(code_matches):
        code = code_match.group(1)
        pos = code_match.start()
        
        # Get context: 200 chars before, 3000 chars after
        before = clean[max(0, pos-200):pos]
        after = clean[pos:pos+3000]
        
        output.append(f"\n{'='*60}")
        output.append(f"MODULE {code} (position {pos})")
        output.append(f"{'='*60}")
        output.append(f"BEFORE: ...{before[-100:]}")
        output.append(f"AFTER: {after[:2000]}")
    
    with open("temp_ele203_modules.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(output))
    
    print(f"\nModule details written to temp_ele203_modules.txt")
    
    # Also, let's look at the very end of the document for Anexo content
    # The Anexo I with module details is usually at the end
    last_5000 = clean[-5000:]
    with open("temp_ele203_end.txt", "w", encoding="utf-8") as f:
        f.write(last_5000)
    print(f"Last 5000 chars written to temp_ele203_end.txt")

if __name__ == "__main__":
    main()
