import os

# 1. Update navigation.ts
nav_file = r"c:\GD-rsp\APP-CuadernoFP\frontend\src\config\navigation.ts"
with open(nav_file, "r", encoding="utf-8") as f:
    nav_content = f.read()

nav_content = nav_content.replace(
    '      { href: "/legal?tab=aviso", label: "Legal", icon: Shield, description: "Legislación y normativas." }\n',
    ''
)
with open(nav_file, "w", encoding="utf-8") as f:
    f.write(nav_content)

# 2. Update Sidebar.tsx
sidebar_file = r"c:\GD-rsp\APP-CuadernoFP\frontend\src\components\layout\Sidebar.tsx"
with open(sidebar_file, "r", encoding="utf-8") as f:
    sidebar_content = f.read()

sidebar_footer_target = """        {/* Logout (demo) */}
        <div className="pt-2 mt-2 border-t border-[var(--glass-border)]">"""

sidebar_footer_replacement = """        {/* Footer Legal */}
        <div className="pt-2 mt-2 border-t border-[var(--glass-border)] flex justify-center">
          <Link href="/legal?tab=aviso" className="text-xs text-muted hover:text-accent transition-colors font-medium">
            &copy; Cuaderno FP | Legal
          </Link>
        </div>

        {/* Logout (demo) */}
        <div className="pt-2 mt-2 border-t border-[var(--glass-border)]">"""

if sidebar_footer_target in sidebar_content:
    sidebar_content = sidebar_content.replace(sidebar_footer_target, sidebar_footer_replacement)
    with open(sidebar_file, "w", encoding="utf-8") as f:
        f.write(sidebar_content)
else:
    print("Could not find sidebar target")

# 3. Transfer from inicio to legal
inicio_file = r"c:\GD-rsp\APP-CuadernoFP\frontend\src\app\inicio\page.tsx"
legal_file = r"c:\GD-rsp\APP-CuadernoFP\frontend\src\app\legal\page.tsx"

with open(inicio_file, "r", encoding="utf-8") as f:
    inicio_content = f.read()

# Extract the JSX block for mapa and contribuciones
import re

start_idx = inicio_content.find('{/* ── CONTENIDO: MAPA WEB ──────────────────────────────────────── */}')
end_idx = inicio_content.find('</MotionWrapper>', start_idx)

if start_idx != -1 and end_idx != -1:
    extracted_block = inicio_content[start_idx:end_idx].strip()
    
    # Remove from inicio
    new_inicio = inicio_content[:start_idx] + inicio_content[end_idx:]
    # Remove from TABS in inicio
    new_inicio = re.sub(r'    { id: "mapa", label: <><span className="inline-flex"><Map className="w-\[1\.2em\] h-\[1\.2em\] mr-1" /></span> Mapa Web</>, cleanLabel: "Mapa Web" },?\n?', '', new_inicio)
    
    with open(inicio_file, "w", encoding="utf-8") as f:
        f.write(new_inicio)

    # Add to legal
    with open(legal_file, "r", encoding="utf-8") as f:
        legal_content = f.read()
    
    legal_target = """              </div>
            )}

          </div>"""
    
    if legal_target in legal_content:
        new_legal = legal_content.replace(legal_target, "              </div>\n            )}\n\n            " + extracted_block + "\n\n          </div>")
        
        # Add to TABS in legal
        tabs_target = """    { id: "accesibilidad", label: <><Accessibility className="w-[1.2em] h-[1.2em] mr-1" /> Accesibilidad</>, cleanLabel: "Accesibilidad" },
  ];"""
        tabs_replacement = """    { id: "accesibilidad", label: <><Accessibility className="w-[1.2em] h-[1.2em] mr-1" /> Accesibilidad</>, cleanLabel: "Accesibilidad" },
    { id: "mapa", label: <><Map className="w-[1.2em] h-[1.2em] mr-1" /> Mapa Web</>, cleanLabel: "Mapa Web" },
    { id: "contribuciones", label: <><Users className="w-[1.2em] h-[1.2em] mr-1" /> Comunidad</>, cleanLabel: "Comunidad" },
  ];"""
        new_legal = new_legal.replace(tabs_target, tabs_replacement)
        
        with open(legal_file, "w", encoding="utf-8") as f:
            f.write(new_legal)
        print("Transfer completed")
    else:
        print("Could not find legal target")
else:
    print("Could not find extracted block")

