"""Test the parser with both formats."""
import re
import sys
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')

with open('temp_boe_failing.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract article 9
art_pattern = re.compile(
    rf'Art[ií]culo[\s\xa0]9\..*?</h5>(.*?)(?=Art[ií]culo[\s\xa0]10\.|$)',
    re.DOTALL | re.IGNORECASE
)
match = art_pattern.search(html)
art9_html = match.group(1)
soup = BeautifulSoup(art9_html, 'html.parser')
text = soup.get_text(separator='\n', strip=True)

# Extract OG with both formats
og = []
for line in text.split('\n'):
    line = line.strip()
    # Format 1: a) text
    og_match = re.match(r'^([a-zñ])\)\s*(.+)', line, re.DOTALL)
    if og_match:
        og.append({'id': og_match.group(1), 'desc': og_match.group(2).strip()})
    else:
        # Format 2: 1. text
        og_match = re.match(r'^(\d+)\.\s+(.+)', line, re.DOTALL)
        if og_match:
            og.append({'id': og_match.group(1), 'desc': og_match.group(2).strip()})

print(f"OG found: {len(og)}")
for item in og:
    print(f"  {item['id']}) {item['desc'][:60]}...")
