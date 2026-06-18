"""Insert extracted OG into the database."""
import json
import sys
import sqlite3

sys.stdout.reconfigure(encoding='utf-8')

# Load extraction results
with open('temp_boe_extraction.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

conn = sqlite3.connect('cdd_pro.db')
c = conn.cursor()

updated = 0
skipped = 0
errors = 0

for result in data['results']:
    code = result['bd_code']
    status = result['status']
    
    if status == 'already_has_og':
        skipped += 1
        continue
    
    if status != 'extracted':
        errors += 1
        continue
    
    og_list = result.get('og', [])
    if not og_list:
        errors += 1
        continue
    
    # Get current boa_articles
    c.execute('SELECT boa_articles FROM degrees WHERE code = ?', (code,))
    row = c.fetchone()
    if not row:
        print(f"  [ERR] Degree {code} not found in BD")
        errors += 1
        continue
    
    existing_json = row[0]
    if existing_json:
        existing = json.loads(existing_json)
    else:
        existing = {}
    
    # Update article_9_og
    existing['article_9_og'] = og_list
    
    # Save back
    new_json = json.dumps(existing, ensure_ascii=False)
    c.execute('UPDATE degrees SET boa_articles = ? WHERE code = ?', (new_json, code))
    updated += 1
    print(f"  [OK] {code}: {len(og_list)} OG inserted")

conn.commit()
conn.close()

print(f"\nSummary:")
print(f"  Updated: {updated}")
print(f"  Skipped (already had OG): {skipped}")
print(f"  Errors: {errors}")
