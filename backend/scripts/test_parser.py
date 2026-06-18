"""Test the corrected BOE parser."""
import re
import sys
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')

with open('temp_boe_sample.html', 'r', encoding='utf-8') as f:
    html = f.read()

HEADERS = {'User-Agent': 'Mozilla/5.0'}

# Test the new parser
articles = {}
for i in range(1, 10):
    art_pattern = re.compile(
        rf'Art[ií]culo\xa0{i}\..*?</h5>(.*?)(?=Art[ií]culo\xa0{i+1}\.|$)',
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

print()

# Extract OG from article 9
og = []
art9_html = articles.get('article_9', '')
if art9_html:
    soup_art9 = BeautifulSoup(art9_html, 'html.parser')
    for p in soup_art9.find_all('p'):
        p_text = p.get_text(strip=True)
        og_match = re.match(r'^([a-z])\)\s*(.+)', p_text, re.DOTALL)
        if og_match:
            letter = og_match.group(1)
            desc = og_match.group(2).strip()
            og.append({
                'id': letter,
                'desc': desc
            })

print(f"OG found: {len(og)}")
for item in og:
    print(f"  {item['id']}) {item['desc'][:80]}...")
