import re
import os

BANNER_TEMPLATE_PAGE = """          <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6">
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

PAGES = {
    r"frontend\src\app\calendario\page.tsx": {"title": "Calendario Escolar — Resolución Anual Autonómica", "desc": "Adaptación de la programación a los días lectivos y festivos oficiales."},
    r"frontend\src\app\familias\page.tsx": {"title": "Familias Profesionales — Ley 3/2022", "desc": "Clasificación oficial de cualificaciones y competencias sectoriales."},
    r"frontend\src\app\feoe\page.tsx": {"title": "Fase en Empresa (FEOE) — Ley 3/2022", "desc": "Seguimiento y evaluación del periodo de formación dual en el centro de trabajo."},
    r"frontend\src\app\progreso\page.tsx": {"title": "Progreso y Estadísticas — Ley 3/2022", "desc": "Monitorización del rendimiento académico y logro de resultados."}
}

COMPS = {
    r"frontend\src\components\features\alumnado\TutoriaTab.tsx": {"title": "Tutoría — RD 659/2023 (Art. 100)", "desc": "Acción tutorial y orientación personal y profesional."},
    r"frontend\src\components\features\modulo\ContextoFEOETab.tsx": {"title": "Contexto y FEOE — Ley 3/2022", "desc": "Integración del período en empresa en el currículo del módulo."},
    r"frontend\src\components\features\modulo\ContextoTab.tsx": {"title": "Contexto — RD 659/2023", "desc": "Análisis del entorno, centro educativo y perfil del alumnado."},
    r"frontend\src\components\features\modulo\DatosTab.tsx": {"title": "Módulo Profesional — RD 659/2023", "desc": "Estructura, duración y normativa aplicable al módulo formativo."},
    r"frontend\src\components\features\modulo\EvaluacionRecursosTab.tsx": {"title": "Evaluación y Recursos — RD 659/2023", "desc": "Mecanismos de evaluación, recuperación y recursos materiales."},
    r"frontend\src\components\features\modulo\MetodologiaTab.tsx": {"title": "Metodología — RD 659/2023", "desc": "Estrategias metodológicas y medidas de atención a la diversidad."},
    r"frontend\src\components\features\modulo\OtrosElementosTab.tsx": {"title": "Otros Elementos — RD 659/2023", "desc": "Elementos transversales y competencias personales/sociales."},
    r"frontend\src\components\features\modulo\PlanesTab.tsx": {"title": "Planes y Proyectos — RD 659/2023", "desc": "Integración de planes institucionales en la programación didáctica."},
    r"frontend\src\components\features\seguimiento\AsistenciaTab.tsx": {"title": "Asistencia y Participación — RD 659/2023", "desc": "Seguimiento de la asistencia obligatoria y evaluación continua."}
}

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

for filepath, data in PAGES.items():
    if not os.path.exists(filepath): continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    content = inject_info_import(content)
    banner_html = BANNER_TEMPLATE_PAGE.replace("{title}", data["title"]).replace("{desc}", data["desc"])
    content = re.sub(r'(<MotionWrapper[^>]*>)', r'\1\n' + banner_html, content, count=1)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for filepath, data in COMPS.items():
    if not os.path.exists(filepath): continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    content = inject_info_import(content)
    banner_html = BANNER_TEMPLATE_COMP.replace("{title}", data["title"]).replace("{desc}", data["desc"])
    
    content = re.sub(r'(return\s*\(\s*)', r'\1<>\n' + banner_html + '\n', content, count=1)
    
    idx = content.rfind(');')
    if idx != -1:
        content = content[:idx] + '  </>\n  ' + content[idx:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done restoring banners securely.")
