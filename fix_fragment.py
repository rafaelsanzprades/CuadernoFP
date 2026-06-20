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
    
    # Check if we have `return (\n      <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5`
    # and if it's NOT already wrapped in `<>`
    # We will just replace `return (` or `return (` with `return (\n    <>`
    # and replace the last `);` that corresponds to it with `</>\n  );`
    
    if '<Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />' in content:
        # Check if it already has <> after return (
        if re.search(r'return\s*\(\s*<>', content):
            print(f"Already wrapped: {filepath}")
            continue
            
        # We need to find the `return (` that precedes the banner.
        # Actually the easiest way is to find `return (\n      <div className="flex items-start gap-3 p-4`
        # and replace it.
        pattern_start = re.compile(r'(return\s*\(\s*)(<div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5)', re.MULTILINE)
        
        match = pattern_start.search(content)
        if match:
            new_content = content[:match.start(1)] + match.group(1) + "<>\n" + match.group(2) + content[match.end(2):]
            
            # Now find the last `);` in the file. Since these are usually at the end of the component
            # let's find `  );\n}` at the end of the file
            pattern_end = re.compile(r'(\s*\);\s*\n\})')
            match_end = list(pattern_end.finditer(new_content))
            if match_end:
                last_match = match_end[-1]
                new_content = new_content[:last_match.start(1)] + "\n    </>" + last_match.group(1) + new_content[last_match.end(1):]
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Wrapped in fragment: {filepath}")
            else:
                print(f"Could not find end of return in {filepath}")
        else:
            print(f"Could not find start pattern in {filepath}")
