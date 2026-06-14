import re
with open('cdd_pro.db', 'rb') as f:
    data = f.read()

# Look for the beginning of df_ce
offsets = [m.start() for m in re.finditer(b'"df_ce": \\[\{"id_ra": "RA1", "id_ce": "CE1.a"', data)]

if offsets:
    print(f"Found {len(offsets)} matches")
    for off in offsets:
        # Extract a large chunk
        chunk = data[off:off+10000]
        # Find the end of the array
        try:
            # We are looking for "df_ce": [{...}]
            # Find the closing bracket ']' that matches this array.
            # We can just write the raw string to a file and parse it manually.
            with open(f'recovered_ce_{off}.txt', 'wb') as out:
                out.write(chunk)
            print(f"Wrote chunk at offset {off}")
        except Exception as e:
            print("Error", e)
else:
    print("Not found")
