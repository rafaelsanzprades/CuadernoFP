"""Test the full parser pipeline."""
import re
import sys
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')

with open('temp_boe_sample.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Step 1: Extract articles
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

print()

# Step 2: Extract OG from article 9
og = []
art9_text = articles.get('article_9', '')
if art9_text:
    # Split by newlines and find OG
    for line in art9_text.split('\n'):
        line = line.strip()
        og_match = re.match(r'^([a-zñ])\)\s*(.+)', line, re.DOTALL)
        if og_match:
            letter = og_match.group(1)
            desc = og_match.group(2).strip()
            og.append({
                'id': letter,
                'desc': desc
            })

print(f"OG found: {len(og)}")
for item in og:
    print(f"  {item['id']}) {item['desc'][:60]}...")
