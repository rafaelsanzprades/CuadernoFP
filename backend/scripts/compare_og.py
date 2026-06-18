"""Compare OG from BOE vs DB for ELE203"""
import sqlite3
import json

# Load parsed OG from BOE
with open("temp_ele203_og_parsed.json", encoding="utf-8") as f:
    boe_og = json.load(f)

# Filter only real OG items (single letter, a-w)
real_og = [item for item in boe_og if len(item["letter"]) == 1 and item["letter"].isalpha()]

# Load from DB
conn = sqlite3.connect("cdd_pro.db")
cursor = conn.cursor()
cursor.execute("""
    SELECT id_og, desc_og 
    FROM curriculo_og 
    WHERE id_modulo = 1319 
    ORDER BY id_og
""")
db_og = cursor.fetchall()
conn.close()

# Build comparison
lines = []
lines.append(f"BOE OG count: {len(real_og)}")
lines.append(f"DB OG count: {len(db_og)}")
lines.append("")

# Compare by position
max_len = max(len(real_og), len(db_og))
matches = 0
diffs = 0

for i in range(max_len):
    boe_item = real_og[i] if i < len(real_og) else None
    db_item = db_og[i] if i < len(db_og) else None
    
    if boe_item and db_item:
        db_id, db_desc = db_item
        boe_text = boe_item["text"]
        
        # Compare first 80 chars to check if they match
        if db_desc[:80] == boe_text[:80]:
            lines.append(f"({boe_item['letter']}) MATCH")
            matches += 1
        else:
            lines.append(f"({boe_item['letter']}) DIFF")
            lines.append(f"  DB:  {db_desc[:120]}")
            lines.append(f"  BOE: {boe_text[:120]}")
            diffs += 1
    elif boe_item:
        lines.append(f"({boe_item['letter']}) MISSING IN DB")
        lines.append(f"  BOE: {boe_item['text'][:120]}")
        diffs += 1
    elif db_item:
        db_id, db_desc = db_item
        lines.append(f"({db_id}) EXTRA IN DB: {db_desc[:80]}")
        diffs += 1

lines.append("")
lines.append(f"SUMMARY: {matches} matches, {diffs} differences")

# Write to file
with open("temp_ele203_comparison.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print("Comparison done. Check temp_ele203_comparison.txt")
