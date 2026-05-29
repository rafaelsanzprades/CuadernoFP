import os, re
import glob

files = glob.glob('c:/GD-rsp/APP/frontend/src/app/**/page.tsx', recursive=True)
pattern = re.compile(r'<div>(\s*<h1 className="text-4xl font-extrabold text-foreground tracking-tight)')

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if pattern.search(content):
        new_content = pattern.sub(r'<div className="pl-6">\1', content)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {file}')
print('Done!')
