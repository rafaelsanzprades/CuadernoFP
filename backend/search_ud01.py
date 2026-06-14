import re

with open('cdd_pro.db', 'rb') as f:
    data = f.read()

# search for "UD01" and print the surrounding 200 chars
matches = [m.start() for m in re.finditer(b'"UD01"', data)]
for pos in matches:
    print(data[max(0, pos-100):min(len(data), pos+100)].decode('utf-8', errors='ignore'))
    print('---')
