import json
import re

with open('c:\\GD-rsp\\APP\\frontend\\src\\data\\curriculos\\ele203.ts', 'r', encoding='utf-8') as f:
    data = f.read()

idx = data.find('codigo: "0237"')
print(data[idx:idx+2000])
