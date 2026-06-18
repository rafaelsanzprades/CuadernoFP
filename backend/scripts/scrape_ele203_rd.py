"""Scrape Real Decreto 652/2017 for ELE203 OG"""
import urllib.request
import re
import json

RD_ID = "BOE-A-2017-7982"
URL = f"https://www.boe.es/diario_boe/xml.php?id={RD_ID}"

def main():
    print(f"Downloading RD: {RD_ID}")
    req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
    response = urllib.request.urlopen(req, timeout=60)
    raw = response.read()
    text = raw.decode("utf-8", errors="replace")
    
    # Strip HTML
    clean = re.sub(r"<[^>]+>", " ", text)
    clean = re.sub(r"\s+", " ", clean).strip()
    
    with open("temp_ele203_rd.txt", "w", encoding="utf-8") as f:
        f.write(clean)
    print(f"RD text: {len(clean)} chars")
    
    # Find OG section
    idx = clean.lower().find("objetivos generales")
    print(f"'objetivos generales' at: {idx}")
    
    if idx >= 0:
        # Extract the OG section (typically ~2000 chars)
        og_text = clean[idx:idx+5000]
        with open("temp_ele203_rd_og.txt", "w", encoding="utf-8") as f:
            f.write(og_text)
        print(f"OG section saved ({len(og_text)} chars)")
        
        # Parse individual OG items: a), b), c), ...
        og_items = re.findall(r"\(([a-z])\)\s+([^()]+)", og_text)
        print(f"\nFound {len(og_items)} OG items:")
        for letter, content in og_items:
            print(f"  ({letter}) {content[:120].strip()}")
        
        # Save parsed OG as JSON
        parsed = [{"letter": letter, "text": content.strip()} for letter, content in og_items]
        with open("temp_ele203_rd_og.json", "w", encoding="utf-8") as f:
            json.dump(parsed, f, indent=2, ensure_ascii=False)
    
    # Also find module structure (Art. 9 is RD basics, modules start later)
    # Let's find ALL article headers
    articles = list(re.finditer(r"Art[ií]culo (\d+)[\.\s]", clean))
    print(f"\nArticles found: {len(articles)}")
    for art in articles:
        print(f"  Art. {art.group(1)} at position {art.start()}")

if __name__ == "__main__":
    main()
