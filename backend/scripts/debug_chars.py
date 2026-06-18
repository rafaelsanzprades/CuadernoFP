"""Debug: check exact characters in OG text."""
import re
import sys
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')

with open('temp_boe_sample.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract article 9
art9_pattern = re.compile(
    r'Art[ií]culo\xa09\..*?</h5>(.*?)(?=Art[ií]culo\xa010\.|$)',
    re.DOTALL | re.IGNORECASE
)
match = art9_pattern.search(html)
art9_html = match.group(1)

soup = BeautifulSoup(art9_html, 'html.parser')
for i, p in enumerate(soup.find_all('p')):
    p_text = p.get_text(strip=True)
    if len(p_text) > 5:
        # Show first 5 chars with their unicode codepoints
        first_chars = p_text[:10]
        codepoints = ' '.join(f'U+{ord(c):04X}' for c in first_chars)
        print(f"  p[{i}]: codepoints={codepoints}")
        print(f"    text: {p_text[:60]}")
        # Test regex
        m = re.match(r'^([a-zñ])\)\s*(.+)', p_text, re.DOTALL)
        print(f"    regex match: {m is not None}")
        if i > 5:
            break
