import json
import re

seed_file = r'c:\GD-rsp\APP\backend\seed_fictitious_full_data.py'

config_contexto_data = {
    "A1_justificacion": "El presente módulo profesional se imparte dentro del ciclo formativo y aporta al alumnado los conocimientos, procedimientos y actitudes necesarios para el ejercicio profesional en el sector correspondiente, en coherencia con los Resultados de Aprendizaje establecidos en el currículo oficial y en el marco de la normativa vigente de Formación Profesional.",
    "A2_contextualizacion": "El IES Andalán es un centro de titularidad pública situado en el barrio de La Almozara, en Zaragoza. La oferta académica del instituto es amplia y diversa, abarcando diferentes niveles de Educación Secundaria Obligatoria, Bachillerato y Formación Profesional (Familias de Administración y Gestión, y Electricidad y Electrónica). \nUn rasgo distintivo de la identidad del centro es su compromiso con la inclusión, siendo un centro preferente para la escolarización de alumnado con Trastorno del Espectro Autista (TEA) y alumnado con discapacidad motora.",
    "B3_vinculacion_empresa": "El módulo mantiene una relación directa con el tejido empresarial y tecnológico de nuestro entorno. Las orientaciones metodológicas y las tareas competenciales diseñadas persiguen acercar al alumnado a la realidad del sector productivo, preparándolos técnica y actitudinalmente para el módulo de Formación en Empresa u Organismo Equiparado (FEOE) en las empresas colaboradoras de la especialidad.",
    "D2_actividades_ea": "La metodología adoptada integra los contenidos científicos, tecnológicos y organizativos, proporcionando una visión global y coordinada de los procesos productivos propios de la profesión. Favorece en el alumnado la capacidad para aprender de forma autónoma y para trabajar en equipo. Se aplicarán metodologías como:\n- Explicación de contenidos teórico-prácticos.\n- Realización de actividades, ejercicios y prácticas de taller.\n- Trabajo en equipo y aprendizaje basado en proyectos reales del sector.",
    "D3_agrupamientos": "La aplicación de desdobles no se contempla de forma generalizada en este módulo técnico, al no superar la ratio que lo justifique por cuestiones de seguridad y prevención de riesgos. No obstante, se establecen agrupamientos flexibles y trabajo en equipo (por parejas o pequeños grupos) para potenciar el aprendizaje colaborativo en las sesiones prácticas de taller.",
    "F1_diversidad": "Se identifican y respetan las características y necesidades del alumnado, adaptando las metodologías, los recursos y las evaluaciones a sus capacidades (especialmente alineados con nuestro perfil de centro integrador de alumnado TEA). Se planifican actividades que promuevan la participación activa y un sistema de evaluación diversificada que valore el conocimiento teórico, las competencias prácticas y las habilidades blandas. Se contemplarán adaptaciones curriculares no significativas cuando sea requerido.",
    "E5_recuperacion": "Se establecen actividades de recuperación y refuerzo para el alumnado que no haya superado algún Resultado de Aprendizaje a lo largo de la evaluación continua. El alumnado dispondrá de una convocatoria extraordinaria mediante instrumentos específicos (prueba escrita, práctica o proyecto) que permitan demostrar la adquisición de los criterios de evaluación.",
    "G1_infraestructuras": "El proceso de enseñanza-aprendizaje se desarrollará principalmente en las aulas-taller del centro, dotadas con pizarra, cañón proyector y conexión a internet. Se dispondrá del equipamiento específico del ciclo, ordenadores de puesto, herramientas de montaje, bancos de pruebas y equipos de medida propios del laboratorio técnico.",
    "G2_herramientas_tic": "Se utilizará como plataforma virtual principal (Moodle/Google Classroom) para el intercambio de documentación técnica, entrega de tareas y seguimiento. Asimismo, se hará uso del CuadernoFP como herramienta digital oficial para el control docente, junto con simuladores, software ofimático avanzado y aplicaciones específicas del sector productivo.",
    "G3_bibliografia": "Para el correcto seguimiento del módulo, se emplearán apuntes propios del Departamento, libros de texto recomendados de editoriales del sector tecnológico, catálogos técnicos de fabricantes, manuales de equipos, recursos online actualizados y normativa legal aplicable.",
    "H1_complementarias": "Las actividades complementarias y extraescolares se desarrollarán de manera coordinada con el Departamento Didáctico, vinculadas a los Resultados de Aprendizaje del módulo y con incidencia directa en la motivación del alumnado. Se programarán, siempre que sea posible, visitas técnicas a empresas del sector, participación en ferias profesionales y jornadas de orientación laboral o emprendimiento (Aulas APE).",
    "I1_transversales": "En el desarrollo de los contenidos, se potenciará de forma transversal la Prevención de Riesgos Laborales aplicables a la profesión, el fomento de la igualdad efectiva, el respeto al medioambiente (tratamiento de residuos electrónicos) y el fomento del emprendimiento tecnológico, habilidades comunicativas y el trabajo colaborativo.",
    "J3_contingencia": "Ante circunstancias excepcionales que afecten al desarrollo normal de la actividad docente o ausencias justificadas, se enviarán a través del correo electrónico institucional y/o la plataforma digital las tareas y materiales necesarios. El seguimiento de las Unidades Didácticas queda garantizado mediante el registro centralizado en CuadernoFP."
}

with open(seed_file, 'r', encoding='utf-8') as f:
    content = f.read()

config_str = json.dumps(config_contexto_data, indent=4, ensure_ascii=False)

# In Python file, we are replacing a dict definition:
#     "config_contexto": {
#         "curso_escolar": "2025-2026",
# ...
#     },
new_content = re.sub(
    r'"config_contexto":\s*\{[^\}]+\}', 
    f'"config_contexto": {config_str}', 
    content, 
    count=1
)

with open(seed_file, 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Updated Python seed file")
