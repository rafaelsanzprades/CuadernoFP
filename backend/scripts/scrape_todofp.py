"""
Scraper de todofp.es - Extrae ciclos con enlaces BOE y código de centro.
"""
import requests
from bs4 import BeautifulSoup
import json
import re

URL_GM = "https://todofp.es/que-estudiar/grados-d/grado-medio.html"
URL_GS = "https://todofp.es/que-estudiar/grados-d/grado-superior.html"

def extract_center_code(href):
    """Extrae el código del centro del enlace de educación"""
    if not href:
        return None
    match = re.search(r'ensenanzaFP=\d+_(\d+)', href)
    return match.group(1) if match else None

def extract_boe_id(href):
    """Extrae el ID del BOE del enlace"""
    if not href:
        return None
    match = re.search(r'id=(BOE-A-\d+-\d+)', href)
    return match.group(1) if match else None

def scrape_table(url, level):
    """Extrae ciclos de la tabla de todofp.es"""
    print(f"\n{'='*60}")
    print(f"Scraping {level}")
    print('='*60)
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    resp = requests.get(url, headers=headers, timeout=30)
    soup = BeautifulSoup(resp.text, 'html.parser')
    
    table = soup.find('table')
    if not table:
        print("No table found!")
        return []
    
    rows = table.find_all('tr')
    print(f"Total rows: {len(rows)}")
    
    cycles = []
    current_family = ""
    
    for i, row in enumerate(rows):
        if i == 0:  # Skip header
            continue
        
        cells = row.find_all(['td', 'th'])
        if not cells:
            continue
        
        # Determinar si la fila tiene familia (7 cells) o no (6 cells)
        if len(cells) == 7:
            # Fila con familia
            family_cell = cells[0]
            title_cell = cells[1]
            rd_cell = cells[2]
            curr_cell = cells[3]
            ccaa_cell = cells[4]
            profile_cell = cells[5]
            where_cell = cells[6]
            
            family_text = family_cell.get_text(strip=True)
            if family_text:
                current_family = family_text
        else:
            # Fila sin familia (6 cells)
            title_cell = cells[0]
            rd_cell = cells[1]
            curr_cell = cells[2]
            ccaa_cell = cells[3]
            profile_cell = cells[4]
            where_cell = cells[5]
        
        # Extraer título
        title = title_cell.get_text(strip=True)
        if not title or title == 'Familia':
            continue
        
        # Extraer enlace del título (para obtener el código)
        title_link = title_cell.find('a', href=True)
        title_href = title_link.get('href', '') if title_link else ''
        
        # Extraer código del centro del enlace "Dónde estudiar"
        where_link = where_cell.find('a', href=True)
        where_href = where_link.get('href', '') if where_link else ''
        center_code = extract_center_code(where_href)
        
        # Extraer enlaces BOE
        boe_links = []
        for cell in [rd_cell, curr_cell]:
            for a in cell.find_all('a', href=True):
                href = a.get('href', '')
                boe_id = extract_boe_id(href)
                if boe_id:
                    boe_links.append({
                        'id': boe_id,
                        'href': href,
                        'text': a.get_text(strip=True)
                    })
        
        # Extraer perfil profesional
        profile_link = profile_cell.find('a', href=True)
        profile_href = profile_link.get('href', '') if profile_link else ''
        
        cycle = {
            'family': current_family,
            'title': title,
            'title_href': title_href,
            'center_code': center_code,
            'boe_links': boe_links,
            'profile_href': profile_href,
            'where_href': where_href
        }
        
        cycles.append(cycle)
    
    print(f"Extracted {len(cycles)} cycles")
    return cycles

if __name__ == '__main__':
    gm = scrape_table(URL_GM, "Grado Medio")
    gs = scrape_table(URL_GS, "Grado Superior")
    
    all_cycles = {
        'grado_medio': gm,
        'grado_superior': gs
    }
    
    with open('temp_todofp_all.json', 'w', encoding='utf-8') as f:
        json.dump(all_cycles, f, ensure_ascii=False, indent=2)
    
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print('='*60)
    print(f"Grado Medio: {len(gm)} cycles")
    print(f"Grado Superior: {len(gs)} cycles")
    print(f"Total: {len(gm) + len(gs)} cycles")
    
    # Mostrar algunos ejemplos
    print(f"\nExample GM cycles:")
    for c in gm[:5]:
        print(f"  {c['family'][:20]:20} | {c['title'][:40]:40} | {c['center_code']} | {len(c['boe_links'])} BOE")
    
    print(f"\nExample GS cycles:")
    for c in gs[:5]:
        print(f"  {c['family'][:20]:20} | {c['title'][:40]:40} | {c['center_code']} | {len(c['boe_links'])} BOE")
