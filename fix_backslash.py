import os
import re

files_to_fix = [
    r"frontend\src\app\calendario\page.tsx",
    r"frontend\src\app\familias\page.tsx",
    r"frontend\src\app\feoe\page.tsx",
    r"frontend\src\app\progreso\page.tsx",
    r"frontend\src\components\features\alumnado\TutoriaTab.tsx",
    r"frontend\src\components\features\modulo\ContextoFEOETab.tsx",
    r"frontend\src\components\features\modulo\ContextoTab.tsx",
    r"frontend\src\components\features\modulo\DatosTab.tsx",
    r"frontend\src\components\features\modulo\EvaluacionRecursosTab.tsx",
    r"frontend\src\components\features\modulo\MetodologiaTab.tsx",
    r"frontend\src\components\features\modulo\OtrosElementosTab.tsx",
    r"frontend\src\components\features\modulo\PlanesTab.tsx",
    r"frontend\src\components\features\seguimiento\AsistenciaTab.tsx"
]

for filepath in files_to_fix:
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace literal \1 on a line
    new_content = re.sub(r'^[ \t]*\\1\r?\n', '', content, flags=re.MULTILINE)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed: {filepath}")
    else:
        print(f"No match in: {filepath}")
