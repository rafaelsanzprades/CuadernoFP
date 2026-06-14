import re

with open('cdd_pro.db', 'rb') as f:
    data = f.read()

strings = re.findall(b'[\x20-\x7E]{1000,}', data)
for i, s in enumerate(strings):
    try:
        text = s.decode('utf-8')
        if '"desc_ud"' in text and '"id_ud"' in text:
            with open(f'recovered_{i}.txt', 'w', encoding='utf-8') as out:
                out.write(text)
    except:
        pass
