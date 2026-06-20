import re
import os

filepath = "frontend/src/app/matrices/page.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
if 'import { Info }' not in content and 'Info,' not in content and ', Info' not in content:
    content = re.sub(r'(import \{)([^}]+)(\}\s+from\s+"lucide-react")', 
                     r'\1\2, Info \3', content)

# Map of tab id to title and desc
TABS = {
    "ra": {"title": "Resultados de Aprendizaje — RD 659/2023 (Anexos I)", "desc": "Los RA y CE son prescriptivos y definen lo que el alumno debe saber y saber hacer."},
    "ud": {"title": "Unidades Didácticas — RD 659/2023", "desc": "Organización del currículo en unidades de aprendizaje significativas."},
    "relacion": {"title": "Relación RA ↔ UD — RD 659/2023", "desc": "Trazabilidad entre los resultados prescriptivos y las unidades impartidas."},
    "contribucion": {"title": "Contribución a Objetivos Generales — RD 659/2023", "desc": "Alineación de los RA con los objetivos generales del ciclo formativo."}
}

BANNER_TEMPLATE = """                <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6">
                  <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-sm text-muted mt-1">{desc}</p>
                  </div>
                </div>"""

for tab_id, data in TABS.items():
    if "bg-accent/5 border border-accent/20" in content and data["title"] in content:
        continue
    
    # We look for the div right after: {activeTab === "tab_id" && ( \n <div ...>
    # Note: "contribucion" does not have an inner card immediately, but it has <div className="animate-in fade-in duration-500">
    pattern = r'(\{activeTab === "' + tab_id + r'" && \(\s*<div[^>]+>)'
    banner_html = BANNER_TEMPLATE.replace("{title}", data["title"]).replace("{desc}", data["desc"])
    content = re.sub(pattern, r'\1\n' + banner_html, content, count=1)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated matrices/page.tsx")
