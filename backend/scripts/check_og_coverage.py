import sqlite3, json

conn = sqlite3.connect('cdd_pro.db')
c = conn.cursor()
c.execute('SELECT code, name, boa_articles FROM degrees ORDER BY code')
rows = c.fetchall()
print(f'Total: {len(rows)} degrees')

with_og = 0
without_og = 0
for r in rows:
    code, name, boa = r
    if boa:
        data = json.loads(boa)
        og = data.get('article_9_og', [])
        if og:
            with_og += 1
            print(f'  {code}: {name[:50]} | {len(og)} OG')
        else:
            without_og += 1
    else:
        without_og += 1

print()
print(f'With OG: {with_og}')
print(f'Without OG: {without_og}')
conn.close()
