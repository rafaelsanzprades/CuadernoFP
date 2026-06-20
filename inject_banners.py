import os
import re

BANNERS = {
    # Modulo Tabs
    "frontend/src/components/features/modulo/DatosTab.tsx": {
        "title": "Datos del módulo — RD 659/2023 (Art. 93)",
        "desc": "La programación es el instrumento de planificación curricular específico."
    },
    "frontend/src/components/features/modulo/ContextoTab.tsx": {
        "title": "Contexto — RD 659/2023",
        "desc": "Adaptación de la programación al contexto socioprofesional del centro."
    },
    "frontend/src/components/features/modulo/PlanesTab.tsx": {
        "title": "Planes y Proyectos — RD 659/2023",
        "desc": "Inclusión de los planes estratégicos del centro en la programación."
    },
    "frontend/src/components/features/modulo/ContextoFEOETab.tsx": {
        "title": "Contexto y FEOE — Ley 3/2022",
        "desc": "Integración del período en empresa en el currículo del módulo."
    },
    "frontend/src/components/features/modulo/MetodologiaTab.tsx": {
        "title": "Metodología — RD 659/2023",
        "desc": "Estrategias metodológicas para la adquisición de competencias."
    },
    "frontend/src/components/features/modulo/EvaluacionRecursosTab.tsx": {
        "title": "Evaluación y Recursos — RD 659/2023 (Art. 136)",
        "desc": "La evaluación debe ser continua, formativa e integradora."
    },
    "frontend/src/components/features/modulo/OtrosElementosTab.tsx": {
        "title": "Otros Elementos — RD 659/2023",
        "desc": "Medidas de atención a la diversidad y otros elementos transversales."
    },
    
    # Matrices Tabs
    "frontend/src/components/features/matrices/RATab.tsx": {
        "title": "Resultados de Aprendizaje — RD 659/2023 (Anexos I)",
        "desc": "Los RA y CE son prescriptivos y definen lo que el alumno debe saber y saber hacer."
    },
    "frontend/src/components/features/matrices/UDTab.tsx": {
        "title": "Unidades Didácticas — RD 659/2023",
        "desc": "Organización del currículo en unidades de aprendizaje significativas."
    },
    "frontend/src/components/features/matrices/RelacionTab.tsx": {
        "title": "Relación RA ↔ UD — RD 659/2023",
        "desc": "Trazabilidad entre los resultados prescriptivos y las unidades impartidas."
    },
    "frontend/src/components/features/matrices/ContribucionTab.tsx": {
        "title": "Contribución a Objetivos Generales — RD 659/2023",
        "desc": "Alineación de los RA con los objetivos generales del ciclo formativo."
    },
    "frontend/src/components/features/matrices/CompetenciasTab.tsx": {
        "title": "Competencias Profesionales — RD 659/2023",
        "desc": "Relación de las competencias profesionales, personales y sociales (CPPS)."
    },

    # Instrumentos Tabs
    "frontend/src/components/features/instrumentos/ResumenTab.tsx": {
        "title": "Resumen de Instrumentos — RD 659/2023 (Art. 136)",
        "desc": "Visión global de los instrumentos de evaluación utilizados."
    },
    "frontend/src/components/features/instrumentos/TriTab.tsx": {
        "title": "Instrumentos Trimestrales — RD 659/2023 (Art. 136)",
        "desc": "Instrumentos de evaluación continua para la toma de decisiones."
    },

    # Programacion Tabs
    "frontend/src/components/features/programacion/SecuenciacionTab.tsx": {
        "title": "Secuenciación — RD 659/2023",
        "desc": "Distribución temporal de las unidades didácticas."
    },
    "frontend/src/components/features/programacion/TareasTab.tsx": {
        "title": "Tareas Competenciales — RD 659/2023",
        "desc": "Actividades prácticas alineadas con los criterios de evaluación."
    },

    # Alumnado Tabs
    "frontend/src/components/features/alumnado/AlumnadoTab.tsx": {
        "title": "Alumnado — RD 659/2023 (Cap. III)",
        "desc": "Gestión académica y seguimiento del alumnado matriculado."
    },
    "frontend/src/components/features/alumnado/PlanoTab.tsx": {
        "title": "Plano de Clase — RD 659/2023",
        "desc": "Distribución espacial para la gestión del aula."
    },
    "frontend/src/components/features/alumnado/TutoriaTab.tsx": {
        "title": "Tutoría — RD 659/2023 (Art. 100)",
        "desc": "Acción tutorial y orientación personal y profesional."
    },
    "frontend/src/components/features/alumnado/FEOETab.tsx": {
        "title": "Prácticas FEOE — Ley 3/2022",
        "desc": "Seguimiento de la fase de formación en empresa u organismo equiparado."
    },

    # Seguimiento Tabs
    "frontend/src/components/features/seguimiento/DiarioTab.tsx": {
        "title": "Diario de Aula — RD 659/2023",
        "desc": "Registro de la actividad diaria y programación real impartida."
    },
    "frontend/src/components/features/seguimiento/AsistenciaTab.tsx": {
        "title": "Asistencia — RD 659/2023 (Art. 136)",
        "desc": "El control de asistencia es obligatorio para mantener la evaluación continua."
    },

    # Progreso (no tabs usually)
    "frontend/src/app/progreso/page.tsx": {
        "title": "Progreso y Calificaciones — RD 659/2023 (Art. 137)",
        "desc": "Evaluación final de resultados de aprendizaje y toma de decisiones."
    },

    # Calendario (no tabs usually)
    "frontend/src/app/calendario/page.tsx": {
        "title": "Calendario Escolar — Resolución Anual Autonómica",
        "desc": "Adaptación de la programación a los días lectivos y festivos oficiales."
    },
    
    # Profesorado (Tabs)
    "frontend/src/components/features/profesorado/AccesoTab.tsx": {
        "title": "Acceso — RD 659/2023",
        "desc": "Gestión de accesos y perfiles docentes."
    },
    "frontend/src/components/features/profesorado/GestionTab.tsx": {
        "title": "Gestión Docente — RD 659/2023 (Título V)",
        "desc": "Requisitos y atribuciones del profesorado de FP."
    },
    "frontend/src/components/features/profesorado/AsignacionTab.tsx": {
        "title": "Asignación — RD 659/2023",
        "desc": "Asignación de módulos y grupos al profesorado."
    },

    # Familias
    "frontend/src/app/familias/page.tsx": {
        "title": "Familias Profesionales — Ley 3/2022",
        "desc": "Catálogo Nacional de Ofertas de Formación Profesional."
    },
    "frontend/src/app/ciclos/page.tsx": {
        "title": "Catálogo de Ciclos — Ley 3/2022",
        "desc": "Títulos de Formación Profesional y sus respectivos módulos."
    },
    "frontend/src/app/feoe/page.tsx": {
        "title": "Empresas FEOE — Ley 3/2022",
        "desc": "Gestión de empresas colaboradoras para el carácter dual de la FP."
    }
}

BANNER_TEMPLATE = """      <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20 mb-6">
        <Info className="w-5 h-5 text-accent mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted mt-1">{desc}</p>
        </div>
      </div>
"""

def inject_info_import(content):
    if 'import { Info }' in content or 'Info,' in content or ', Info' in content:
        return content
    
    # Try to add to existing lucide-react import
    if 'from "lucide-react"' in content:
        content = re.sub(r'(import\s+\{)([^}]+)(\}\s+from\s+"lucide-react")', 
                         r'\1\2, Info \3', content)
        return content
    
    # Otherwise add new import at top
    lines = content.split('\\n')
    for i, line in enumerate(lines):
        if line.startswith('import '):
            lines.insert(i, 'import { Info } from "lucide-react";')
            return '\\n'.join(lines)
    return content

def inject_banner(filepath, data):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return False
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "bg-accent/5 border border-accent/20" in content and "text-sm text-muted" in content:
        print(f"Banner already exists in: {filepath}")
        return True
        
    content = inject_info_import(content)
    
    banner_html = BANNER_TEMPLATE.format(title=data["title"], desc=data["desc"])
    
    # For page.tsx usually we inject after <MotionWrapper ...> or <div className="space-y-8 ...">
    # Let's try to find <MotionWrapper> first
    if "<MotionWrapper" in content:
        # inject right after <MotionWrapper ...>
        content = re.sub(r'(<MotionWrapper[^>]*>)', r'\\1\n' + banner_html, content, count=1)
    elif 'className="space-y-' in content:
        content = re.sub(r'(<div[^>]*className="[^"]*space-y-[^"]*"[^>]*>)', r'\\1\n' + banner_html, content, count=1)
    else:
        # Just inject after first <div ...> inside return
        print(f"Manual check needed for {filepath}")
        return False
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated: {filepath}")
    return True

for fp, data in BANNERS.items():
    inject_banner(fp, data)

print("Done.")
