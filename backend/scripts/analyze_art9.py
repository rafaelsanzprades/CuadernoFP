"""Analyze article 9 HTML structure."""
import re
import sys
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')

with open('temp_boe_sample.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find article 9
art9_pattern = re.compile(
    r'Art[ií]culo\xa09\..*?</h5>(.*?)(?=Art[ií]culo\xa010\.|$)',
    re.DOTALL | re.IGNORECASE
)
match = art9_pattern.search(html)
if not match:
    print("Article 9 NOT found")
    sys.exit()

art9_html = match.group(1)
print(f"Article 9 HTML length: {len(art9_html)}")
print()

# Parse with BeautifulSoup
soup = BeautifulSoup(art9_html, 'html.parser')

# Show all tags
print("=== TAGS IN ARTICLE 9 ===")
for tag in soup.find_all(True):
    tag_text = tag.get_text(strip=True)[:100]
    print(f"  <{tag.name}> {tag_text}")
print()

# Show raw HTML
print("=== RAW HTML (first 3000 chars) ===")
print(art9_html[:3000])
