"""Test the improved parser with a failing BOE."""
import re
import sys
import requests
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')

HEADERS = {'User-Agent': 'Mozilla/5.0'}

# Test with a failing BOE
boe_id = 'BOE-A-2009-19148'  # ADG201: Gestion Administrativa
url = f"https://www.boe.es/buscar/doc.php?id={boe_id}"
print(f"Fetching {boe_id}...")
resp = requests.get(url, headers=HEADERS, timeout=30)
resp.encoding = 'utf-8'
html = resp.text

print(f"HTML length: {len(html)}")

# Save for analysis
with open('temp_boe_failing.html', 'w', encoding='utf-8') as f:
    f.write(html)

# Try the improved regex
articles = {}
for i in range(1, 10):
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
        print(f"Article {i}: {len(text)} chars")
    else:
        print(f"Article {i}: NOT FOUND")

# If article 9 found, extract OG
art9_text = articles.get('article_9', '')
if art9_text:
    og = []
    for line in art9_text.split('\n'):
        line = line.strip()
        og_match = re.match(r'^([a-zñ])\)\s*(.+)', line, re.DOTALL)
        if og_match:
            og.append({'id': og_match.group(1), 'desc': og_match.group(2).strip()})
    print(f"\nOG found: {len(og)}")
    for item in og[:5]:
        print(f"  {item['id']}) {item['desc'][:60]}...")
else:
    print("\nArticle 9 NOT FOUND - analyzing HTML structure...")
    # Look for all h5 tags
    soup = BeautifulSoup(html, 'html.parser')
    h5_tags = soup.find_all('h5')
    print(f"Found {len(h5_tags)} h5 tags:")
    for h5 in h5_tags[:20]:
        print(f"  <h5>: {h5.get_text(strip=True)[:80]}")
    
    # Search for "Artículo" in raw HTML
    for m in re.finditer(r'Art.{1,10}culo.{1,5}\d+', html):
        print(f"  Found: {html[m.start():m.start()+60]}")
        if m.start() > 100000:
            break
