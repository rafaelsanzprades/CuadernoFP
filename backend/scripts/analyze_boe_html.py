"""Analyze BOE HTML structure to fix the OG parser."""
import re
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

with open('temp_boe_sample.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find article 9
art9_match = re.search(r'Art.{1,10}culo.{1,5}9\. Obj', html)
if not art9_match:
    print("Art 9 NOT found")
    # Try broader search
    for m in re.finditer(r'Art.{1,10}culo.{1,5}\d+', html):
        print(f"  Found: {html[m.start():m.start()+60]}")
    sys.exit()

start = art9_match.start()
print(f"Art 9 found at pos {start}")
print(f"Context: {html[start:start+100]}")
print()

# Find next article (10) or section break
art10_match = re.search(r'Art.{1,10}culo.{1,5}1[0-9]\.', html[start+50:])
if art10_match:
    end = start + 50 + art10_match.start()
else:
    end = start + 10000

art9_html = html[start:end]
print(f"Art 9 HTML length: {len(art9_html)}")
print()

# Extract text from art 9
from bs4 import BeautifulSoup
soup = BeautifulSoup(art9_html, 'html.parser')
text = soup.get_text()
print(f"Art 9 text length: {len(text)}")
print()
print("=== ART 9 TEXT ===")
print(text[:3000])
print()
print("=== END ART 9 TEXT ===")
print()

# Now try to find the actual paragraphs inside article 9 using the HTML
print("=== HTML STRUCTURE ===")
# Find all <p> and list items
for tag in soup.find_all(['p', 'li']):
    tag_text = tag.get_text(strip=True)[:150]
    if tag_text:
        print(f"  [{tag.name}] {tag_text}")
print()
print("=== END HTML STRUCTURE ===")
