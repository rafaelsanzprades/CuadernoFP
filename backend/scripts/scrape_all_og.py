"""
Scraper maestro: todofp.es + BOE para extraer artículos 1-9 de todos los ciclos.
"""
import requests
from bs4 import BeautifulSoup
import json
import re
import time
import sqlite3

# ============================================================
# PART 1: Scrape todofp.es
# ============================================================

URLS = {
    'GM': "https://todofp.es/que-estudiar/grados-d/grado-medio.html",
    'GS': "https://todofp.es/que-estudiar/grados-d/grado-superior.html",
    'GB': "https://todofp.es/que-estudiar/grados-d/fp-grado-basico.html",
}

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

def extract_boe_id(href):
    match = re.search(r'id=(BOE-A-\d+-\d+)', href)
    return match.group(1) if match else None

def scrape_todofp_table(url, level):
    print(f"\n{'='*60}")
    print(f"Scraping todofp.es - {level}")
    print('='*60)
    
    resp = requests.get(url, headers=HEADERS, timeout=30)
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
        if i == 0:
            continue
        
        cells = row.find_all(['td', 'th'])
        if not cells:
            continue
        
        if len(cells) == 7:
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
        elif len(cells) == 6:
            title_cell = cells[0]
            rd_cell = cells[1]
            curr_cell = cells[2]
            ccaa_cell = cells[3]
            profile_cell = cells[4]
            where_cell = cells[5]
        else:
            continue
        
        title = title_cell.get_text(strip=True)
        if not title or title in ('Familia', 'Título'):
            continue
        
        # BOE links
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
        
        # Profile PDF
        profile_link = profile_cell.find('a', href=True)
        profile_href = profile_link.get('href', '') if profile_link else ''
        
        # Where to study (center code)
        where_link = where_cell.find('a', href=True)
        where_href = where_link.get('href', '') if where_link else ''
        center_code_match = re.search(r'ensenanzaFP=\d+_(\d+)', where_href)
        center_code = center_code_match.group(1) if center_code_match else None
        
        cycles.append({
            'family': current_family,
            'title': title,
            'level': level,
            'center_code': center_code,
            'boe_links': boe_links,
            'profile_href': profile_href,
            'where_href': where_href
        })
    
    print(f"Extracted {len(cycles)} cycles")
    return cycles


# ============================================================
# PART 2: Scrape BOE articles
# ============================================================

def scrape_boe_articles(boe_id):
    """Extrae artículos 1-9 de un BOE."""
    url = f"https://www.boe.es/buscar/doc.php?id={boe_id}"
    print(f"  Fetching {boe_id}...")
    
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.encoding = 'utf-8'
        html = resp.text
        
        # Buscar artículos por patrón HTML: <h5>Artículo N. ...</h5>
        articles = {}
        for i in range(1, 10):
            # Buscar "Artículo N." en el HTML (con espacio normal o non-breaking space)
            art_pattern = re.compile(
                rf'Art[ií]culo[\s\xa0]{i}\..*?</h5>(.*?)(?=Art[ií]culo[\s\xa0]{i+1}\.|$)',
                re.DOTALL | re.IGNORECASE
            )
            match = art_pattern.search(html)
            if match:
                art_html = match.group(1)
                soup_art = BeautifulSoup(art_html, 'html.parser')
                text = soup_art.get_text(separator='\n', strip=True)
                articles[f"article_{i}"] = text
        
        # Buscar OG específicamente (artículo 9, apartados a-z o 1-N)
        og = []
        art9_text = articles.get('article_9', '')
        if art9_text:
            # Dividir por líneas y buscar apartados
            for line in art9_text.split('\n'):
                line = line.strip()
                # Formato 1: a) texto, b) texto, etc.
                og_match = re.match(r'^([a-zñ])\)\s*(.+)', line, re.DOTALL)
                if og_match:
                    letter = og_match.group(1)
                    desc = og_match.group(2).strip()
                    og.append({
                        'id': letter,
                        'desc': desc
                    })
                else:
                    # Formato 2: 1. texto, 2. texto, etc.
                    og_match = re.match(r'^(\d+)\.\s+(.+)', line, re.DOTALL)
                    if og_match:
                        num = og_match.group(1)
                        desc = og_match.group(2).strip()
                        og.append({
                            'id': num,
                            'desc': desc
                        })
        
        return {
            'articles': articles,
            'og': og,
            'url': url
        }
        
    except Exception as e:
        print(f"  Error: {e}")
        return None


# ============================================================
# PART 3: Match todofp cycles with BD degrees
# ============================================================

def match_with_bd(todofp_cycles):
    """Match todofp cycles with BD degrees by name."""
    conn = sqlite3.connect('cdd_pro.db')
    c = conn.cursor()
    c.execute('SELECT id, code, name, level, boa_articles FROM degrees')
    bd_degrees = []
    for row in c.fetchall():
        bd_degrees.append({
            'id': row[0],
            'code': row[1],
            'name': row[2],
            'level': row[3],
            'boa_articles': row[4]
        })
    conn.close()
    
    matched = []
    unmatched = []
    
    for cycle in todofp_cycles:
        cycle_name = cycle['title'].lower()
        # Normalizar: quitar "técnico en", "técnico superior en"
        cycle_name_clean = re.sub(r't[eé]cnico\s+(superior\s+)?en\s+', '', cycle_name).strip()
        
        best_match = None
        best_score = 0
        
        for bd in bd_degrees:
            bd_name = bd['name'].lower()
            bd_name_clean = re.sub(r't[eé]cnico\s+(superior\s+)?en\s+', '', bd_name).strip()
            
            # Score por similitud
            if cycle_name_clean == bd_name_clean:
                score = 100
            elif cycle_name_clean in bd_name_clean or bd_name_clean in cycle_name_clean:
                score = 80
            else:
                # Buscar palabras comunes
                cycle_words = set(cycle_name_clean.split())
                bd_words = set(bd_name_clean.split())
                common = cycle_words & bd_words
                if len(common) >= 2:
                    score = 60 + len(common) * 10
                else:
                    score = 0
            
            if score > best_score:
                best_score = score
                best_match = bd
        
        if best_match and best_score >= 60:
            matched.append({
                'todofp': cycle,
                'bd': best_match,
                'score': best_score
            })
        else:
            unmatched.append(cycle)
    
    return matched, unmatched


# ============================================================
# MAIN
# ============================================================

if __name__ == '__main__':
    # Step 1: Scrape todofp.es
    all_cycles = []
    for level, url in URLS.items():
        cycles = scrape_todofp_table(url, level)
        all_cycles.extend(cycles)
    
    print(f"\n{'='*60}")
    print(f"TOTAL CYCLES FROM TODOFP: {len(all_cycles)}")
    print('='*60)
    
    # Step 2: Match with BD
    print(f"\nMatching with BD...")
    matched, unmatched = match_with_bd(all_cycles)
    print(f"Matched: {len(matched)}")
    print(f"Unmatched: {len(unmatched)}")
    
    # Step 3: Scrape BOE for matched cycles
    print(f"\n{'='*60}")
    print(f"SCRAPING BOE ARTICLES")
    print('='*60)
    
    results = []
    errors = []
    
    for i, m in enumerate(matched):
        todofp = m['todofp']
        bd = m['bd']
        
        print(f"\n[{i+1}/{len(matched)}] {bd['code']}: {bd['name'][:40]}")
        
        # Verificar si ya tiene OG
        if bd['boa_articles']:
            existing = json.loads(bd['boa_articles'])
            if 'article_9_og' in existing and existing['article_9_og']:
                print(f"  [OK] Ya tiene OG ({len(existing['article_9_og'])} items)")
                results.append({
                    'bd_code': bd['code'],
                    'bd_name': bd['name'],
                    'status': 'already_has_og',
                    'og_count': len(existing['article_9_og'])
                })
                continue
        
        # Scrapear BOE
        if not todofp['boe_links']:
            print(f"  [WARN] No BOE links")
            errors.append({
                'bd_code': bd['code'],
                'error': 'no_boe_links'
            })
            continue
        
        # Usar el primer enlace BOE (Real Decreto)
        boe_id = todofp['boe_links'][0]['id']
        boe_data = scrape_boe_articles(boe_id)
        
        if boe_data and boe_data['og']:
            print(f"  [OK] Extraido {len(boe_data['og'])} OG")
            results.append({
                'bd_code': bd['code'],
                'bd_name': bd['name'],
                'status': 'extracted',
                'boe_id': boe_id,
                'og': boe_data['og'],
                'articles': boe_data['articles']
            })
        else:
            print(f"  [ERR] No se pudo extraer OG")
            errors.append({
                'bd_code': bd['code'],
                'boe_id': boe_id,
                'error': 'extraction_failed'
            })
        
        # Pausa breve
        time.sleep(0.3)
    
    # Guardar resultados
    output = {
        'total_cycles': len(all_cycles),
        'matched': len(matched),
        'unmatched': len(unmatched),
        'extracted': len([r for r in results if r['status'] == 'extracted']),
        'already_has_og': len([r for r in results if r['status'] == 'already_has_og']),
        'errors': len(errors),
        'results': results,
        'errors_list': errors
    }
    
    with open('temp_boe_extraction.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print('='*60)
    print(f"Total cycles: {len(all_cycles)}")
    print(f"Matched with BD: {len(matched)}")
    print(f"Already have OG: {len([r for r in results if r['status'] == 'already_has_og'])}")
    print(f"Extracted from BOE: {len([r for r in results if r['status'] == 'extracted'])}")
    print(f"Errors: {len(errors)}")
    print(f"\nResults saved to temp_boe_extraction.json")
