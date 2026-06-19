"""
Fix matching: Re-scrape BOE articles with STRICT name matching.
Only matches if the normalized names are very similar (>80% overlap).
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

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'cdd_pro.db')

URLS = {
    'GM': "https://todofp.es/que-estudiar/grados-d/grado-medio.html",
    'GS': "https://todofp.es/que-estudiar/grados-d/grado-superior.html",
    'GB': "https://todofp.es/que-estudiar/grados-d/fp-grado-basico.html",
}


def extract_boe_id(href):
    match = re.search(r'id=(BOE-A-\d+-\d+)', href)
    return match.group(1) if match else None


def scrape_boe_articles(boe_id):
    url = f"https://www.boe.es/buscar/doc.php?id={boe_id}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.encoding = 'utf-8'
        html = resp.text
        articles = {}
        for i in range(2, 10):
            pat = re.compile(
                rf'Art[ií]culo[\s\xa0]{i}\..*?</h5>(.*?)(?=Art[ií]culo[\s\xa0]{i+1}\.|$)',
                re.DOTALL | re.IGNORECASE
            )
            m = pat.search(html)
            if m:
                soup = BeautifulSoup(m.group(1), 'html.parser')
                text = soup.get_text(separator='\n', strip=True)
                articles[f"article_{i}"] = text
        return articles
    except Exception as e:
        print(f"  Error: {e}")
        return None


def parse_article_5_cpps(text):
    items = []
    if not text:
        return items
    for line in text.split('\n'):
        line = line.strip()
        m = re.match(r'^([a-zñ])\)\s*(.+)', line, re.DOTALL)
        if m:
            items.append({'id': m.group(1), 'desc': m.group(2).strip()})
        else:
            m = re.match(r'^(\d+)\.\s+(.+)', line, re.DOTALL)
            if m:
                items.append({'id': m.group(1), 'desc': m.group(2).strip()})
    return items


def parse_article_6_cps_ucs(text):
    cps = []
    ucs = []
    if not text:
        return cps, ucs
    current_cp_letter = None
    for line in text.split('\n'):
        line = line.strip()
        cp_match = re.match(r'^([a-zñ])\)\s*(\S+)\s*\(([^)]+)\)\.\s*(.+)', line)
        if cp_match:
            current_cp_letter = cp_match.group(1)
            cps.append({
                'id': current_cp_letter,
                'code': cp_match.group(2),
                'ref': cp_match.group(3),
                'desc': cp_match.group(4).strip()
            })
            continue
        uc_match = re.match(r'^[—\-–]*\s*(UC\d+[^\s:]*)\s*[:]\s*(.+)', line)
        if uc_match and current_cp_letter:
            ucs.append({
                'id': uc_match.group(1),
                'cp_id': current_cp_letter,
                'desc': uc_match.group(2).strip()
            })
    return cps, ucs


def parse_article_9_og(text):
    items = []
    if not text:
        return items
    for line in text.split('\n'):
        line = line.strip()
        m = re.match(r'^([a-zñ])\)\s*(.+)', line, re.DOTALL)
        if m:
            items.append({'id': m.group(1), 'desc': m.group(2).strip()})
        else:
            m = re.match(r'^(\d+)\.\s+(.+)', line, re.DOTALL)
            if m:
                items.append({'id': m.group(1), 'desc': m.group(2).strip()})
    return items


def build_boa_articles(articles):
    result = dict(articles)
    if 'article_5' in articles:
        cpps = parse_article_5_cpps(articles['article_5'])
        if cpps:
            result['article_5_cpps'] = cpps
    if 'article_6' in articles:
        cps, ucs = parse_article_6_cps_ucs(articles['article_6'])
        if cps:
            result['article_6_cps'] = cps
        if ucs:
            result['article_6_ucs'] = ucs
    if 'article_9' in articles:
        og = parse_article_9_og(articles['article_9'])
        if og:
            result['article_9_og'] = og
    return result


def normalize_name(name):
    """Normalize title name for matching."""
    if ' - ' in name:
        name = name.split(' - ', 1)[1]
    name = re.sub(r'^T[eé]cnico\s+(Superior\s+)?en\s+', '', name, flags=re.IGNORECASE)
    name = ' '.join(name.split())
    return name.lower().strip()


def names_match(name1, name2):
    """Strict name matching - must be very similar."""
    n1 = normalize_name(name1)
    n2 = normalize_name(name2)
    
    # Exact match
    if n1 == n2:
        return True
    
    # One contains the other (at least 80% of shorter name)
    shorter = min(len(n1), len(n2))
    if shorter < 10:
        return n1 == n2
    
    # Check if 80% of words match
    words1 = set(n1.split())
    words2 = set(n2.split())
    if not words1 or not words2:
        return False
    
    common = words1 & words2
    ratio = len(common) / min(len(words1), len(words2))
    
    return ratio >= 0.8


if __name__ == '__main__':
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Get titles without article_2
    c.execute("SELECT code, name, boa_articles FROM degrees WHERE boa_articles IS NOT NULL AND boa_articles NOT LIKE '%article_2%'")
    titles = c.fetchall()
    print(f"{len(titles)} titles to fix")

    # Scrape all todofp.es cycles
    print("\nScraping todofp.es for BOE links...")
    all_cycles = []
    for level, url in URLS.items():
        resp = requests.get(url, headers=HEADERS, timeout=30)
        soup = BeautifulSoup(resp.text, 'html.parser')
        table = soup.find('table')
        if not table:
            continue
        rows = table.find_all('tr')
        current_family = ""
        for i, row in enumerate(rows):
            if i == 0:
                continue
            cells = row.find_all(['td', 'th'])
            if not cells:
                continue
            if len(cells) == 7:
                family_text = cells[0].get_text(strip=True)
                if family_text:
                    current_family = family_text
                title_cell = cells[1]
                rd_cell = cells[2]
            elif len(cells) == 6:
                title_cell = cells[0]
                rd_cell = cells[1]
            else:
                continue
            title = title_cell.get_text(strip=True)
            if not title or title in ('Familia', 'Título'):
                continue
            boe_links = []
            for a in rd_cell.find_all('a', href=True):
                boe_id = extract_boe_id(a.get('href', ''))
                if boe_id:
                    boe_links.append(boe_id)
            all_cycles.append({
                'title': title,
                'family': current_family,
                'level': level,
                'boe_links': boe_links,
            })

    print(f"Found {len(all_cycles)} cycles from todofp.es")

    # Match with STRICT name matching
    matched = []
    unmatched = []

    for code, name, boa_json in titles:
        best_match = None
        best_score = 0
        
        for cycle in all_cycles:
            if names_match(name, cycle['title']):
                # Calculate similarity score for ranking
                n1 = normalize_name(name)
                n2 = normalize_name(cycle['title'])
                words1 = set(n1.split())
                words2 = set(n2.split())
                common = words1 & words2
                score = len(common) / min(len(words1), len(words2)) if words1 and words2 else 0
                
                if score > best_score:
                    best_score = score
                    best_match = cycle
        
        if best_match:
            matched.append({
                'code': code,
                'name': name,
                'boa_json': boa_json,
                'cycle': best_match,
                'score': best_score
            })
        else:
            unmatched.append((code, name))

    print(f"Matched: {len(matched)}")
    print(f"Unmatched: {len(unmatched)}")

    if unmatched:
        print("\nUnmatched:")
        for code, name in unmatched[:10]:
            print(f"  {code}: {name}")

    # Scrape BOE for matched
    fixed = 0
    errors = 0

    for m in matched:
        code = m['code']
        name = m['name']
        boa_json = m['boa_json']
        cycle = m['cycle']

        print(f"\n{code}: {name[:50]} (score={m['score']:.2f})")

        if not cycle['boe_links']:
            print(f"  [ERR] No BOE link")
            errors += 1
            continue

        boe_id = cycle['boe_links'][0]
        print(f"  Found BOE: {boe_id}")

        articles = scrape_boe_articles(boe_id)
        if not articles:
            print(f"  [ERR] Failed to scrape BOE")
            errors += 1
            time.sleep(0.3)
            continue

        boa = build_boa_articles(articles)
        n = len([k for k in boa if k.startswith('article_') and '_' not in k.replace('article_', '')])
        print(f"  [OK] {n} articles")

        # Merge with existing
        existing = json.loads(boa_json)
        for key, val in boa.items():
            existing[key] = val

        c.execute('UPDATE degrees SET boa_articles = ? WHERE code = ?',
                  (json.dumps(existing, ensure_ascii=False), code))
        fixed += 1
        time.sleep(0.3)

    conn.commit()
    conn.close()

    print(f"\n{'='*60}")
    print(f"FIX RESULTS")
    print(f"{'='*60}")
    print(f"Fixed: {fixed}")
    print(f"Errors: {errors}")
