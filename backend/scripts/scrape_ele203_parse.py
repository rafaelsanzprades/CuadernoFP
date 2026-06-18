"""Parse OG from RD 652/2017 for ELE203 and compare with DB"""
import re
import json

def main():
    with open("temp_ele203_rd_og.txt", encoding="utf-8") as f:
        text = f.read()
    
    # The OG are in format: a) Text. b) Text. c) Text. etc.
    # They use lowercase letters with parentheses
    # Split by pattern: letter) 
    # But we need to be careful with ñ)
    
    # Strategy: find all positions of "letter)" pattern
    og_items = []
    
    # Find all matches of pattern: start of line or space + letter) + text
    pattern = r"([a-zñ])\)\s+"
    matches = list(re.finditer(pattern, text))
    
    print(f"Found {len(matches)} OG items")
    
    for i, match in enumerate(matches):
        letter = match.group(1)
        start = match.end()
        
        # End is start of next item or end of text
        if i + 1 < len(matches):
            end = matches[i + 1].start()
        else:
            end = len(text)
        
        og_text = text[start:end].strip()
        # Remove trailing period if present
        og_text = og_text.rstrip(".")
        
        og_items.append({
            "letter": letter,
            "text": og_text
        })
        
        print(f"\n({letter}) {og_text[:150]}...")
    
    # Save parsed OG
    with open("temp_ele203_og_parsed.json", "w", encoding="utf-8") as f:
        json.dump(og_items, f, indent=2, ensure_ascii=False)
    
    print(f"\n\nTotal OG: {len(og_items)}")
    print("Saved to temp_ele203_og_parsed.json")
    
    # Now compare with what we have in DB
    # Let's check what's in the DB for ELE203
    print("\n\n=== COMPARISON WITH DB ===")
    print("DB has 26 OG for ELE203 (from seed_ele203_boa.py)")
    print(f"BOE has {len(og_items)} OG")
    
    # Show first 5 for comparison
    print("\nFirst 5 from BOE:")
    for item in og_items[:5]:
        print(f"  ({item['letter']}) {item['text'][:100]}")

if __name__ == "__main__":
    main()
