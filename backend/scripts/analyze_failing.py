"""Analyze article 9 content of a failing BOE."""
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
if not match:
    print("Article 9 NOT found")
    sys.exit()

art9_html = match.group(1)
soup = BeautifulSoup(art9_html, 'html.parser')
text = soup.get_text(separator='\n', strip=True)

print(f"Article 9 text length: {len(text)}")
print()
print("=== FIRST 2000 CHARS ===")
print(text[:2000])
print()
print("=== LOOKING FOR OG PATTERNS ===")
for line in text.split('\n'):
    line = line.strip()
    if len(line) > 10:
        # Show first 20 chars with codepoints
        first = line[:15]
        cps = ' '.join(f'U+{ord(c):04X}' for c in first)
        print(f"  [{cps}] {line[:60]}")
