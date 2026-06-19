"""
Scraper maestro: todofp.es + BOE para extraer artículos 2-9 de TODOS los ciclos.
Guarda TODOS los artículos (no solo OG) en la BD.

Uso:
    python scripts/scrape_all_boa.py              # Scrape + insertar
    python scripts/scrape_all_boa.py --dry-run    # Solo scrape, no insertar
    python scripts/scrape_all_boa.py --resume     # Saltar títulos que ya tienen artículos
"""
import requests
from bs4 import BeautifulSoup
import json
import re
import time
import sqlite3
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

# ============================================================
# CONFIG
# ============================================================

URLS = {
    'GM': "https://todofp.es/que-estudiar/grados-d/grado-medio.html",
    'GS': "https://todofp.es/que-estudiar/grados-d/grado-superior.html",
    'GB': "https://todofp.es/que-estudiar/grados-d/fp-grado-basico.html",
}

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'cdd_pro.db')

DRY_RUN = '--dry-run' in sys.argv
RESUME = '--resume' in sys.argv


# ============================================================
# PART 1: Scrape todofp.es
# ============================================================

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

        cycles.append({
            'family': current_family,
            'title': title,
            'level': level,
            'boe_links': boe_links,
        })

    print(f"Extracted {len(cycles)} cycles")
    return cycles


# ============================================================
# PART 2: Scrape BOE articles 2-9
# ============================================================

def scrape_boe_articles(boe_id):
    """Extrae artículos 2-9 de un BOE."""
    url = f"https://www.boe.es/buscar/doc.php?id={boe_id}"

    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.encoding = 'utf-8'
        html = resp.text

        articles = {}
        for i in range(2, 10):
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

        return articles

    except Exception as e:
        print(f"  Error fetching BOE: {e}")
        return None


# ============================================================
# PART 3: Parse structured articles
# ============================================================

def parse_article_5_cpps(text):
    """Parse art. 5 → CPPs (Competencias Profesionales, Personales y Sociales)."""
    items = []
    if not text:
        return items

    for line in text.split('\n'):
        line = line.strip()
        # Formato: a) descripción
        m = re.match(r'^([a-zñ])\)\s*(.+)', line, re.DOTALL)
        if m:
            items.append({'id': m.group(1), 'desc': m.group(2).strip()})
        else:
            # Formato: 1. descripción
            m = re.match(r'^(\d+)\.\s+(.+)', line, re.DOTALL)
            if m:
                items.append({'id': m.group(1), 'desc': m.group(2).strip()})

    return items


def parse_article_6_cps_ucs(text):
    """Parse art. 6 → CPs (Cualificaciones Profesionales) y UCs (Unidades de Competencia)."""
    cps = []
    ucs = []
    if not text:
        return cps, ucs

    current_cp_id = None
    current_cp_letter = None

    for line in text.split('\n'):
        line = line.strip()

        # CP: a) ELE043_2 (R.D. ...) Descripción
        cp_match = re.match(
            r'^([a-zñ])\)\s*(\S+)\s*\(([^)]+)\)\.\s*(.+)',
            line
        )
        if cp_match:
            current_cp_letter = cp_match.group(1)
            current_cp_id = cp_match.group(1)
            cps.append({
                'id': current_cp_letter,
                'code': cp_match.group(2),
                'ref': cp_match.group(3),
                'desc': cp_match.group(4).strip()
            })
            continue

        # UC: —UC0120_2: descripción  (con guion largo o normal)
        uc_match = re.match(
            r'^[—\-–]*\s*(UC\d+[^\s:]*)\s*[:]\s*(.+)',
            line
        )
        if uc_match and current_cp_letter:
            ucs.append({
                'id': uc_match.group(1),
                'cp_id': current_cp_letter,
                'desc': uc_match.group(2).strip()
            })
            continue

        # UC alternativo: UC0120_2: descripción (sin guion)
        uc_match2 = re.match(r'^(UC\d+\S*)\s*[:]\s*(.+)', line)
        if uc_match2 and current_cp_letter:
            ucs.append({
                'id': uc_match2.group(1),
                'cp_id': current_cp_letter,
                'desc': uc_match2.group(2).strip()
            })

    return cps, ucs


def parse_article_9_og(text):
    """Parse art. 9 → OGs (Objetivos Generales)."""
    items = []
    if not text:
        return items

    for line in text.split('\n'):
        line = line.strip()
        # Formato: a) descripción
        m = re.match(r'^([a-zñ])\)\s*(.+)', line, re.DOTALL)
        if m:
            items.append({'id': m.group(1), 'desc': m.group(2).strip()})
        else:
            # Formato: 1. descripción
            m = re.match(r'^(\d+)\.\s+(.+)', line, re.DOTALL)
            if m:
                items.append({'id': m.group(1), 'desc': m.group(2).strip()})

    return items


def build_boa_articles(articles):
    """Construye el dict completo de boa_articles con artículos raw + parsed."""
    result = {}

    for key, text in articles.items():
        result[key] = text

    # Parse article 5 → CPPs
    if 'article_5' in articles:
        cpps = parse_article_5_cpps(articles['article_5'])
        if cpps:
            result['article_5_cpps'] = cpps

    # Parse article 6 → CPs + UCs
    if 'article_6' in articles:
        cps, ucs = parse_article_6_cps_ucs(articles['article_6'])
        if cps:
            result['article_6_cps'] = cps
        if ucs:
            result['article_6_ucs'] = ucs

    # Parse article 9 → OGs
    if 'article_9' in articles:
        og = parse_article_9_og(articles['article_9'])
        if og:
            result['article_9_og'] = og

    return result


# ============================================================
# PART 4: Match todofp cycles with BD degrees
# ============================================================

def match_with_bd(todofp_cycles):
    """Match todofp cycles with BD degrees by code or name."""
    conn = sqlite3.connect(DB_PATH)
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
        cycle_title = cycle['title'].lower()
        cycle_clean = re.sub(r't[eé]cnico\s+(superior\s+)?en\s+', '', cycle_title).strip()

        best_match = None
        best_score = 0

        for bd in bd_degrees:
            bd_name = bd['name'].lower()
            bd_clean = re.sub(r't[eé]cnico\s+(superior\s+)?en\s+', '', bd_name).strip()

            # Exact match
            if cycle_clean == bd_clean:
                score = 100
            elif cycle_clean in bd_clean or bd_clean in cycle_clean:
                score = 80
            else:
                # Word overlap
                cycle_words = set(cycle_clean.split())
                bd_words = set(bd_clean.split())
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
    print("=" * 60)
    print("SCRAPER BOA COMPLETO - Artículos 2-9")
    print(f"Modo: {'DRY RUN (no insertar)' if DRY_RUN else 'INSERTAR en BD'}")
    print(f"Resume: {'SÍ (saltar existentes)' if RESUME else 'NO (re-scrapear todo)'}")
    print("=" * 60)

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

    if unmatched:
        print("\nUnmatched cycles:")
        for u in unmatched[:10]:
            print(f"  - {u['title']} ({u['family']})")
        if len(unmatched) > 10:
            print(f"  ... and {len(unmatched) - 10} more")

    # Step 3: Scrape BOE for matched cycles
    print(f"\n{'='*60}")
    print(f"SCRAPING BOE ARTICLES 2-9")
    print('='*60)

    conn = sqlite3.connect(DB_PATH)
    db_cursor = conn.cursor()

    scraped = 0
    skipped = 0
    errors = 0
    inserted = 0

    for i, m in enumerate(matched):
        todofp = m['todofp']
        bd = m['bd']

        print(f"\n[{i+1}/{len(matched)}] {bd['code']}: {bd['name'][:50]}")

        # Check if already has full articles
        if RESUME and bd['boa_articles']:
            existing = json.loads(bd['boa_articles'])
            if 'article_2' in existing and 'article_9' in existing:
                print(f"  [SKIP] Ya tiene artículos 2-9 completos")
                skipped += 1
                continue

        # Check BOE links
        if not todofp['boe_links']:
            print(f"  [WARN] No BOE links")
            errors += 1
            continue

        # Use first BOE link (Real Decreto)
        boe_id = todofp['boe_links'][0]['id']
        articles = scrape_boe_articles(boe_id)

        if not articles:
            print(f"  [ERR] No se pudieron extraer artículos")
            errors += 1
            time.sleep(0.3)
            continue

        # Build full boa_articles dict
        boa = build_boa_articles(articles)
        n_articles = len([k for k in boa if k.startswith('article_') and not '_' in k.replace('article_', '')])
        n_parsed = len([k for k in boa if '_' in k.replace('article_', '')])

        print(f"  [OK] {n_articles} artículos, {n_parsed} parsed structures")
        scraped += 1

        if not DRY_RUN:
            # Merge with existing boa_articles
            existing_json = bd['boa_articles']
            if existing_json:
                existing = json.loads(existing_json)
                # Keep existing parsed data if we don't have new data
                for key in ['article_5_cpps', 'article_6_cps', 'article_6_ucs', 'article_9_og']:
                    if key not in boa and key in existing:
                        boa[key] = existing[key]
            else:
                existing = {}

            # Merge: don't overwrite existing keys unless we have new data
            for key, val in boa.items():
                existing[key] = val

            new_json = json.dumps(existing, ensure_ascii=False)
            db_cursor.execute(
                'UPDATE degrees SET boa_articles = ? WHERE code = ?',
                (new_json, bd['code'])
            )
            inserted += 1
            print(f"  [DB] Guardado en BD")

        time.sleep(0.3)

    conn.commit()
    conn.close()

    # Summary
    print(f"\n{'='*60}")
    print(f"RESUMEN FINAL")
    print('='*60)
    print(f"Total títulos en todofp.es: {len(all_cycles)}")
    print(f"Matched con BD: {len(matched)}")
    print(f"Unmatched: {len(unmatched)}")
    print(f"Scrapeados: {scraped}")
    print(f"Skipped (ya tenían artículos): {skipped}")
    print(f"Insertados en BD: {inserted}")
    print(f"Errores: {errors}")

    # Verify final state
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT COUNT(*) FROM degrees WHERE boa_articles IS NOT NULL')
    total_with_boa = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM degrees WHERE boa_articles LIKE '%article_2%'")
    total_with_full = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM degrees WHERE boa_articles LIKE '%article_9_og%'")
    total_with_og = c.fetchone()[0]
    conn.close()

    print(f"\nEstado final en BD:")
    print(f"  Títulos con boa_articles: {total_with_boa}")
    print(f"  Títulos con artículos completos (2-9): {total_with_full}")
    print(f"  Títulos con OG parseados: {total_with_og}")
