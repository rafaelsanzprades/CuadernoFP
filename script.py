import os, re

replacements = {
    r'Procedimiento de acreditaci.n y reconocimiento de competencias profesionales .*? Eje 8\.': 'Procedimiento de acreditación y reconocimiento de CPPS (Eje 8).',
    r'Revisa lo que toca impartir hoy y el estado general de tu clase\.': 'Resumen diario: estado de clase y UD a impartir.',
    r'Gesti.n oficial de estudiantes, tutor.a, asignaci.n FEOE y orientaci.n profesional\.': 'Gestión de alumnado, tutoría, FEOE y orientación.',
    r'Jefatura de Estudios: Asigna el profesorado a los m.dulos de cada ciclo formativo\.': 'Gestión de Jefatura: asignación de profesorado a módulos.',
    r'Verifica la coherencia de tus datos, consulta la gu.a de inicio o encuentra respuestas a dudas comunes\.': 'Guía de inicio, FAQ y validación de datos.',
    r'Fechas generales, trimestres, horario semanal, festivos y eventos relevantes del curso\.': 'Horarios, trimestres, festivos y eventos del curso.',
    r'Autoevaluaci.n y mejora continua seg.n el Marco Com.n de Garant.a de Calidad \(EQAVET\)\.': 'Autoevaluación y mejora continua (EQAVET).',
    r'Cat.logo oficial de Familias profesionales, T.tulos y desglose de m.dulos del BOE/BOA\.': 'Catálogo oficial de familias, títulos y módulos.',
    r'Generaci.n de reportes y boletines en PDF\.': 'Generación de reportes y boletines (PDF).',
    r'Explorador de archivos oficiales, legislaci.n y otros documentos\.': 'Explorador de legislación, normativas y docs oficiales.',
    r'Crea, abre y guarda tus archivos de Programaci.n y Curso\.': 'Gestión de archivos de Programación y Curso.',
    r'Cat.logo oficial de Ciclos Formativos\. Grado B.sico, Grado Medio y Grado Superior': 'Catálogo oficial de CFGB, CFGM y CFGS.',
    r'Gesti.n de empresas colaboradoras, asignaci.n de alumnado y seguimiento de pr.cticas duales y FCT\.': 'Gestión de FEOE, Dual y FCT.',
    r'Dashboard de los 34 indicadores del Sistema Estatal de Evaluaci.n y Calidad de la FP\.': 'Indicadores del Sist. Estatal de Evaluación y Calidad.',
    r'Accede r.pidamente a todas las herramientas para la gesti.n de tus m.dulos, alumnado y evaluaci.n\.': 'Panel de acceso rápido a gestión, alumnado y evaluación.',
    r'Proyectos de innovaci.n y emprendimiento .*? Indicador 7\.3 del Sistema Estatal\.': 'Proyectos de innovación y emprendimiento (Ind. 7.3).',
    r'Indicadores de inserci.n profesional de titulados de FP .*? Eje 6 del Sistema Estatal\.': 'Inserción laboral de titulados (Eje 6).',
    r'Definici.n y ponderaci.n de las herramientas y m.todos de evaluaci.n\.': 'Definición y ponderación de CE, RA e instrumentos.',
    r'Programas de movilidad y cooperaci.n internacional .*? Eje 12 del Sistema Estatal\.': 'Programas de movilidad y cooperación (Eje 12).',
    r'Aviso legal, privacidad, licencia y t.rminos de uso\.': 'Aviso legal, privacidad y licencias.',
    r'Relaci.n y ponderaci.n entre los RA, CE y las diferentes UD del m.dulo\.': 'Relación y ponderación: OG, RA, CE y UD.',
    r'Configuraci.n b.sica del m.dulo did.ctico\.': 'Configuración de FEOE, metodología, recursos y evaluación.',
    r'Administraci.n del profesorado, perfiles y asignaciones docentes\.': 'Gestión de profesorado, accesos y asignaciones.',
    r'Secuenciaci.n temporal de las unidades did.cticas y dise.o de tareas competenciales\.': 'Secuenciación temporal de UD y tareas competenciales.',
    r'Panel integrado de calificaciones num.ricas, evaluaci.n por resultados de aprendizaje \(RA\) y anal.ticas\.': 'Calificaciones, evaluación de RA y analíticas.',
    r'Registro detallado del desarrollo diario de las clases y contingencias\.': 'Diario de aula, contingencias, control de asistencia y alertas.'
}

for root, dirs, files in os.walk('frontend/src/app'):
    if 'page.tsx' in files:
        path = os.path.join(root, 'page.tsx')
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content
        for pattern, replacement in replacements.items():
            new_content = re.sub(
                r'(<h1[^>]*>.*?</h1>\s*<p className=[\'\"]?text-muted[^>]*>)\s*' + pattern + r'\s*(</p>)',
                r'\g<1>' + replacement + r'\g<2>',
                new_content,
                flags=re.DOTALL
            )
            
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'Updated {path}')
