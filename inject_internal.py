import re
import os

BANNERS = {
    "agenda/page.tsx": {
        "title": "Herramienta operativa y de gestión — Agenda",
        "desc": "Organización personal del tiempo y eventos del docente."
    },
    "ayuda/page.tsx": {
        "title": "Soporte y Ayuda",
        "desc": "Aspectos genéricos de uso y asistencia técnica para la aplicación."
    },
    "descargas/page.tsx": {
        "title": "Herramienta operativa y de gestión — Descargas",
        "desc": "Exportación y generación de documentos en formatos estándar."
    },
    "documentos/page.tsx": {
        "title": "Herramienta operativa y de gestión — Documentos",
        "desc": "Gestión centralizada de ficheros y recursos del docente."
    },
    "entorno/page.tsx": {
        "title": "Herramienta operativa y de gestión — Entorno de Trabajo",
        "desc": "Sincronización en la nube y configuración del espacio de trabajo."
    },
    "inicio/page.tsx": {
        "title": "Herramienta operativa y de gestión — Dashboard",
        "desc": "Tablero principal y utilidades diarias del docente."
    },
    "legal/page.tsx": {
        "title": "Aspectos legales genéricos",
        "desc": "Aviso legal, privacidad, cookies y licencias de la plataforma."
    },
    "asignaciones/page.tsx": {
        "title": "Herramienta operativa y de gestión — Asignaciones",
        "desc": "Gestión de los grupos y asignaturas impartidas en el curso lectivo."
    },
    "acreditacion/page.tsx": {
        "title": "Acreditación de Competencias — RD 659/2023 (Título VI)",
        "desc": "Procedimiento de evaluación y acreditación de competencias profesionales."
    },
    "calidad/page.tsx": {
        "title": "Sistema de Calidad — RD 659/2023 (Título VIII)",
        "desc": "Evaluación de la calidad del sistema de Formación Profesional."
    },
    "innovacion/page.tsx": {
        "title": "Innovación e Investigación — RD 659/2023 (Título VII)",
        "desc": "Proyectos de innovación, investigación aplicada y emprendimiento."
    },
    "insercion/page.tsx": {
        "title": "Orientación e Inserción Laboral — Ley 3/2022 (Título VII)",
        "desc": "Seguimiento de la empleabilidad e inserción laboral del alumnado."
    },
    "internacionalizacion/page.tsx": {
        "title": "Internacionalización — Ley 3/2022 (Título VIII)",
        "desc": "Participación en proyectos internacionales y movilidad."
    },
    "indicadores/page.tsx": {
        "title": "Sistema de Indicadores — Ley 3/2022",
        "desc": "Medición y seguimiento del desempeño y cumplimiento de objetivos."
    },
    "catalogo/page.tsx": {
        "title": "Catálogo Nacional — Ley 3/2022",
        "desc": "Catálogo Nacional de Estándares de Competencias Profesionales."
    }
}

BANNER_TEMPLATE = """      <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6">
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

for page_rel, data in BANNERS.items():
    filepath = f"frontend/src/app/{page_rel}"
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "bg-accent/5 border border-accent/20" in content:
        print(f"Banner already exists in: {filepath}")
        continue
        
    content = inject_info_import(content)
    banner_html = BANNER_TEMPLATE.replace("{title}", data["title"]).replace("{desc}", data["desc"])
    
    # Try to inject right after MotionWrapper, or after the page title Header/h1 equivalent.
    if "<MotionWrapper" in content:
        # Check if there is className on MotionWrapper
        if "<MotionWrapper className=" in content:
            content = re.sub(r'(<MotionWrapper[^>]*>)', r'\1\n' + banner_html, content, count=1)
        else:
            content = re.sub(r'(<MotionWrapper>)', r'\1\n' + banner_html, content, count=1)
    else:
        # Just inject inside <main> if no MotionWrapper
        if "<main " in content:
            content = re.sub(r'(<main[^>]*>)', r'\1\n' + banner_html, content, count=1)
        else:
            print(f"Could not find insertion point for {filepath}")
            continue

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated: {filepath}")

print("Done.")
