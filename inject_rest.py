import re
import os

BANNER_TEMPLATE = """                <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6">
                  <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-sm text-muted mt-1">{desc}</p>
                  </div>
                </div>"""

BANNER_TEMPLATE_COMP = """      <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6">
        <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted mt-1">{desc}</p>
        </div>
      </div>"""

def inject_info_import(content):
    if 'import { Info }' in content or 'Info,' in content or ', Info' in content:
        return content
    if 'from "lucide-react"' in content:
        content = re.sub(r'(import\s+\{)([^}]+)(\}\s+from\s+"lucide-react")', 
                         r'\1\2, Info \3', content)
        return content
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if line.startswith('import '):
            lines.insert(i, 'import { Info } from "lucide-react";')
            return '\n'.join(lines)
    return content

def inject_page_tab(filepath, tab_id, title, desc):
    if not os.path.exists(filepath):
        print(f"Not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if title in content:
        return
    content = inject_info_import(content)
    pattern = r'(\{activeTab === "' + tab_id + r'" && \(\s*<div[^>]+>|\{activeTab === "' + tab_id + r'" && \(\s*<Card[^>]+>)'
    banner_html = BANNER_TEMPLATE.replace("{title}", title).replace("{desc}", desc)
    content = re.sub(pattern, r'\1\n' + banner_html, content, count=1)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filepath} for tab {tab_id}")

def inject_page_func(filepath, func_name, title, desc):
    if not os.path.exists(filepath):
        print(f"Not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if title in content:
        return
    content = inject_info_import(content)
    pattern = r'(const ' + func_name + r' = [^{]+\{\s*(?:.*\s*)+?return \(\s*<div[^>]+>)'
    banner_html = BANNER_TEMPLATE.replace("{title}", title).replace("{desc}", desc)
    content = re.sub(pattern, r'\1\n' + banner_html, content, count=1)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {filepath} for function {func_name}")

def inject_component(filepath, title, desc):
    if not os.path.exists(filepath):
        print(f"Not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if title in content:
        return
    content = inject_info_import(content)
    banner_html = BANNER_TEMPLATE_COMP.replace("{title}", title).replace("{desc}", desc)
    if '<div className="space-y-' in content:
        content = re.sub(r'(return\s*\(\s*<div[^>]*className="[^"]*space-y-[^"]*"[^>]*>)', r'\1\n' + banner_html, content, count=1)
    else:
        content = re.sub(r'(return\s*\(\s*<div[^>]*>)', r'\1\n' + banner_html, content, count=1)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated component {filepath}")

# instrumentos/page.tsx
inject_page_tab("frontend/src/app/instrumentos/page.tsx", "resumen", "Resumen de Instrumentos — RD 659/2023 (Art. 136)", "Visión global de los instrumentos de evaluación utilizados.")
inject_page_func("frontend/src/app/instrumentos/page.tsx", "renderTrimestreTab", "Instrumentos Trimestrales — RD 659/2023 (Art. 136)", "Instrumentos de evaluación continua para la toma de decisiones.")

# programacion/page.tsx
inject_page_tab("frontend/src/app/programacion/page.tsx", "secuenciacion", "Secuenciación — RD 659/2023", "Distribución temporal de las unidades didácticas.")
inject_page_tab("frontend/src/app/programacion/page.tsx", "tareas", "Tareas Competenciales — RD 659/2023", "Actividades prácticas alineadas con los criterios de evaluación.")

# alumnado/page.tsx
inject_page_tab("frontend/src/app/alumnado/page.tsx", "alumnado", "Alumnado — RD 659/2023 (Cap. III)", "Gestión académica y seguimiento del alumnado matriculado.")

# seguimiento/page.tsx (assuming activeTab="diario" is there or we just check if it's there)
inject_page_tab("frontend/src/app/seguimiento/page.tsx", "diario", "Diario de Aula — RD 659/2023", "Registro de la actividad diaria y programación real impartida.")

# Components
inject_component("frontend/src/components/features/alumnado/PlanoClaseTab.tsx", "Plano de Clase — RD 659/2023", "Distribución espacial para la gestión del aula.")
inject_component("frontend/src/components/features/alumnado/FeoeAssignTab.tsx", "Prácticas FEOE — Ley 3/2022", "Seguimiento de la fase de formación en empresa u organismo equiparado.")
inject_component("frontend/src/components/features/profesorado/AccesoUsuariosTab.tsx", "Acceso — RD 659/2023", "Gestión de accesos y perfiles docentes.")
inject_component("frontend/src/components/features/profesorado/GestionUsuariosTab.tsx", "Gestión Docente — RD 659/2023 (Título V)", "Requisitos y atribuciones del profesorado de FP.")
inject_component("frontend/src/components/features/profesorado/AsignacionDocentesTab.tsx", "Asignación — RD 659/2023", "Asignación de módulos y grupos al profesorado.")
inject_component("frontend/src/components/features/profesorado/AsignacionModulosTab.tsx", "Asignación — RD 659/2023", "Asignación de módulos y grupos al profesorado.")

print("All done")
