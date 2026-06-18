"""Test scraper: extraer OG de BOE-A-2019-18090 (ELE203)"""
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
    
    # Save clean text for debugging
    with open("temp_ele203_clean2.txt", "w", encoding="utf-8") as f:
        f.write(clean)
    
    # Search for key terms
    terms = [
        "Objetivos Generales", "Objetivos generales", "objetivos generales",
        "Objetivo General", "objetivo general",
        "Perfil profesional", "perfil profesional",
        "Resultados de Aprendizaje", "resultados de aprendizaje",
        "Unidad de Competencia", "unidad de competencia",
        "Anexo", "anexo",
        "Contenidos B", "contenidos b",
        "Modulos profesionales", "modulos profesionales",
        "Modulos del ciclo", "modulos del ciclo",
    ]
    
    found = {}
    for term in terms:
        idx = clean.find(term)
        if idx >= 0:
            found[term] = idx
            
    print(f"\nFound {len(found)} terms:")
    for term, idx in sorted(found.items(), key=lambda x: x[1]):
        context = clean[idx:idx+200]
        print(f"  [{idx:6d}] {term}")
        print(f"           {context[:150]}")
    
    # Now let's look for the OG section specifically
    # In BOE orders, OGs are usually listed as "a)" "b)" etc.
    # They appear BEFORE the module contents
    
    # Strategy: find the FIRST "a)" that looks like an OG (long text, uppercase start)
    # OG typically say things like "Analizar...", "Desarrollar...", etc.
    
    # Let's extract the full text and find structural markers
    # The BOE order has: Art.1, Art.2... then Anexo with modules
    # Each module has: Objetivos, Contenidos, Resultados de Aprendizaje, Criterios
    
    # Let's find all occurrences of patterns like "Objetivos:" or "Objetivos."
    obj_positions = [m.start() for m in re.finditer(r"Objetivos[:\.]", clean, re.IGNORECASE)]
    print(f"\n'Objetivos:' found at {len(obj_positions)} positions: {obj_positions}")
    
    # Let's also look for "modulo profesional" to understand structure
    mod_positions = [m.start() for m in re.finditer(r"[Mm]odulo [Pp]rofesional", clean)]
    print(f"'Modulo profesional' found at {len(mod_positions)} positions: {mod_positions}")
    
    # Extract text around each Objetivos position
    results = []
    for i, pos in enumerate(obj_positions):
        # Get surrounding context - look backwards for module name
        before = clean[max(0, pos-300):pos]
        after = clean[pos:pos+2000]
        
        # Extract module code/name from before
        code_match = re.search(r"Codigo:\s*(\d+)", before)
        code = code_match.group(1) if code_match else "unknown"
        
        # Extract objectives from after
        # OG are typically "a) ..." then "b) ..." etc.
        og_items = re.findall(r"([a-z])\)\s+([^a-z\)]+)", after)
        
        results.append({
            "position": pos,
            "module_code": code,
            "num_items": len(og_items),
            "items_preview": [(letter, text[:100]) for letter, text in og_items[:5]]
        })
        
        print(f"\n--- Objectives block #{i+1} at {pos} (module code: {code}) ---")
        for letter, preview in og_items[:3]:
            print(f"  {letter}) {preview}")
    
    # Save results
    with open("temp_ele203_analysis.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n\nTotal objectives blocks found: {len(results)}")
    print("Results saved to temp_ele203_analysis.json")

if __name__ == "__main__":
    main()
