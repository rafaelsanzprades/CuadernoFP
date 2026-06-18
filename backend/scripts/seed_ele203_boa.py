import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database import SessionLocal
from models import Degree

def seed():
    db = SessionLocal()
    degree = db.query(Degree).filter(Degree.code == "ELE203").first()
    if not degree:
        print("Degree ELE203 not found!")
        return

    degree.boa_articles = {
        "article_2": "El título de Técnico en Instalaciones de Telecomunicaciones queda identificado por los siguientes elementos:\nFamilia Profesional: Electricidad y Electrónica\nDenominación: Instalaciones de Telecomunicaciones\nNivel: Formación Profesional de Grado Medio\nDuración: 2000 horas.\nReferente europeo: CINE-3 (Clasificación Internacional Normalizada de la Educación)",
        "article_3": "El perfil profesional del título de Técnico en Instalaciones de Telecomunicaciones queda determinado por su competencia general, sus competencias profesionales, personales y sociales, por la relación de cualificaciones y, en su caso, unidades de competencia del Catálogo Nacional de Cualificaciones Profesionales incluidas en el título.",
        "article_4": "La competencia general de este título consiste en montar y mantener instalaciones de telecomunicaciones y audiovisuales, instalaciones de radiocomunicaciones e instalaciones domóticas, aplicando normativa y reglamentación vigente, protocolos de calidad, seguridad y riesgos laborales, asegurando su funcionalidad y respeto al medio ambiente.",
        "article_5": "Las competencias profesionales, personales y sociales de este título son las que se relacionan a continuación:",
        "article_5_cpps": [
            {"id": "a", "desc": "Establecer la logística asociada al montaje y mantenimiento, interpretando la documentación técnica de las infraestructuras, instalaciones y equipos."},
            {"id": "b", "desc": "Configurar y calcular instalaciones de telecomunicaciones, audiovisuales, domóticas y eléctricas de interior, determinando el emplazamiento y características de los elementos que las constituyen, respetando las especificaciones y las prescripciones reglamentarias."},
            {"id": "c", "desc": "Elaborar el presupuesto de montaje o mantenimiento de la instalación o equipo."},
            {"id": "d", "desc": "Acopiar los recursos y medios para acometer la ejecución del montaje o mantenimiento de las instalaciones y equipos."},
            {"id": "e", "desc": "Replantear la instalación de acuerdo a la documentación técnica, resolviendo los problemas de su competencia e informando de otras contingencias, para asegurar la viabilidad del montaje."},
            {"id": "f", "desc": "Montar o ampliar equipos informáticos y periféricos, configurándolos, asegurando y verificando su funcionamiento, en condiciones de calidad y seguridad."},
            {"id": "g", "desc": "Instalar y configurar software base, sistemas operativos y aplicaciones asegurando y verificando su funcionamiento, en condiciones de calidad y seguridad."},
            {"id": "h", "desc": "Montar los elementos componentes de las infraestructuras e instalaciones (canalizaciones, cableado, armarios, soportes, entre otros) utilizando técnicas de montaje, en condiciones de calidad, seguridad y respeto al medio ambiente."},
            {"id": "i", "desc": "Instalar los equipos (cámaras, procesadores de señal, centralitas, entre otros) utilizando herramientas de programación y asegurando su funcionamiento, en condiciones de calidad y seguridad."},
            {"id": "j", "desc": "Mantener y reparar instalaciones y equipos realizando las operaciones de comprobación, ajuste o sustitución de sus elementos y reprogramando los equipos, restituyendo su funcionamiento en condiciones de calidad, seguridad y respeto al medio ambiente."},
            {"id": "k", "desc": "Verificar el funcionamiento de la instalación o equipo realizando pruebas funcionales y de comprobación, para proceder a su puesta en servicio."},
            {"id": "l", "desc": "Elaborar la documentación técnica y administrativa de la instalación o equipo, de acuerdo con la reglamentación y normativa vigente y con los requerimientos del cliente."},
            {"id": "m", "desc": "Aplicar los protocolos y normas de seguridad, de calidad y respeto al medio ambiente en las intervenciones realizadas en los procesos de montaje y mantenimiento de las instalaciones."},
            {"id": "n", "desc": "Integrarse en la organización de la empresa colaborando en la consecución de los objetivos y participando activamente en el grupo de trabajo con actitud respetuosa y tolerante."},
            {"id": "o", "desc": "Cumplir con los objetivos de la producción, colaborando con el equipo de trabajo y actuando conforme a los principios de responsabilidad y tolerancia."},
            {"id": "p", "desc": "Adaptarse a diferentes puestos de trabajo y nuevas situaciones laborales, originados por cambios tecnológicos y organizativos en los procesos productivos."},
            {"id": "q", "desc": "Resolver problemas y tomar decisiones individuales siguiendo las normas y procedimientos establecidos, definidos dentro del ámbito de su competencia."},
            {"id": "r", "desc": "Ejercer sus derechos y cumplir con las obligaciones derivadas de las relaciones laborales, de acuerdo con lo establecido en la legislación vigente."},
            {"id": "s", "desc": "Gestionar su carrera profesional, analizando las oportunidades de empleo, autoempleo y de aprendizaje."},
            {"id": "t", "desc": "Crear y gestionar una pequeña empresa, realizando un estudio de viabilidad de productos, de planificación de la producción y de comercialización."},
            {"id": "u", "desc": "Participar de forma activa en la vida económica, social y cultural, con una actitud crítica y responsable."}
        ],
        "article_6": "1. Cualificaciones profesionales completas:\na) ELE043_2 (R.D. 295/2004, de 20 de febrero). Montaje y mantenimiento de infraestructuras de telecomunicaciones en edificios, que comprende las siguientes unidades de competencia:\n—UC0120_2: Montar y mantener instalaciones de captación de señales de radiodifusión sonora y TV en edificios o conjuntos de edificaciones (antenas y vía cable).\n—UC0121_2: Montar y mantener instalaciones de acceso al servicio de telefonía disponible al público e instalaciones de control de acceso (telefonía interior y videoportería).\nb) ELE188-2 (R.D. 1228/2006, de 27 de octubre). Montaje y mantenimiento de instalaciones de megafonía, sonorización de locales y circuito cerrado de televisión, que comprende las siguientes unidades de competencia:\n—UC0597_2: Montar y mantener instalaciones de megafonía y sonorización de locales.\n—UC0598_2: Montar y mantener instalaciones de circuito cerrado de televisión.\nc) ELE189-2 (R.D. 1228/2006, de 27 de octubre). Montaje y mantenimiento de sistemas de telefonía e infraestructuras de redes locales de datos, que comprende las siguientes unidades de competencia:\n—UC0599_2: Montar y mantener sistemas de telefonía con centralitas de baja capacidad.\n—UC0600_2: Montar y mantener infraestructuras de redes locales de datos.",
        "article_6_cps": [
            {"id": "a", "code": "ELE043_2", "ref": "R.D. 295/2004, de 20 de febrero", "desc": "Montaje y mantenimiento de infraestructuras de telecomunicaciones en edificios"},
            {"id": "b", "code": "ELE188-2", "ref": "R.D. 1228/2006, de 27 de octubre", "desc": "Montaje y mantenimiento de instalaciones de megafonía, sonorización de locales y circuito cerrado de televisión"},
            {"id": "c", "code": "ELE189-2", "ref": "R.D. 1228/2006, de 27 de octubre", "desc": "Montaje y mantenimiento de sistemas de telefonía e infraestructuras de redes locales de datos"}
        ],
        "article_6_ucs": [
            {"id": "UC0120_2", "cp_id": "a", "desc": "Montar y mantener instalaciones de captación de señales de radiodifusión sonora y TV en edificios o conjuntos de edificaciones (antenas y vía cable)."},
            {"id": "UC0121_2", "cp_id": "a", "desc": "Montar y mantener instalaciones de acceso al servicio de telefonía disponible al público e instalaciones de control de acceso (telefonía interior y videoportería)."},
            {"id": "UC0597_2", "cp_id": "b", "desc": "Montar y mantener instalaciones de megafonía y sonorización de locales."},
            {"id": "UC0598_2", "cp_id": "b", "desc": "Montar y mantener instalaciones de circuito cerrado de televisión."},
            {"id": "UC0599_2", "cp_id": "c", "desc": "Montar y mantener sistemas de telefonía con centralitas de baja capacidad."},
            {"id": "UC0600_2", "cp_id": "c", "desc": "Montar y mantener infraestructuras de redes locales de datos."}
        ],
        "article_7": "1. Este profesional ejerce su actividad en microempresas y en empresas pequeñas y medianas, mayoritariamente privadas, en las áreas de montaje y mantenimiento de infraestructuras de telecomunicación, instalaciones de circuito cerrado de televisión y seguridad electrónica, centralitas telefónicas e infraestructuras de redes de voz y datos, sonorización y megafonía, instalaciones de radiocomunicaciones, sistemas domóticos y equipos informáticos, bien por cuenta propia o ajena.\n2. Las ocupaciones y puestos de trabajo más relevantes son los siguientes:\na) Instalador de telecomunicaciones en edificios de viviendas.\nb) Instalador de antenas.\nc) Instalador de sistemas de seguridad.\nd) Técnico en redes locales y telemática.\ne) Técnico en instalación y mantenimiento de redes locales.\nf) Instalador de telefonía.\ng) Instalador-montador de equipos telefónicos y telemáticos.\nh) Técnico en instalaciones de sonido.\ni) Instalador de megafonía.\nj) Instalador-mantenedor de sistemas domóticos.\nk) Técnico instalador-mantenedor de equipos informáticos.\nl) Técnico en montaje y mantenimiento de sistemas de radiodifusión.",
        "article_8": "1. El perfil profesional de este título, dentro del sector terciario, evoluciona hacia un técnico con gran especialización en la instalación y mantenimiento de infraestructuras de telecomunicaciones, sistemas de seguridad, redes, domótica, telefonía, sonido y equipos informáticos y con un incremento en el desempeño de funciones de planificación, calidad y prevención de riesgos laborales.\n2. La evolución tecnológica se está consolidando sobre las redes de telecomunicación de banda ancha, basadas principalmente en fibra óptica para el tránsito de cualquier tipo de información. Será necesaria la utilización de técnicas y procedimientos concretos para la manipulación de estos materiales así como del uso de equipamiento de comprobación y medida específico (identificadores de fibras, microscopios, reflectómetros ópticos, medidores de continuidad y de potencia).\n3. Las estructuras organizativas tienden a configurarse sobre la base de decisiones descentralizadas y equipos participativos de gestión, potenciando la autonomía y capacidad de decisión.\n4. Las características del mercado de trabajo, la movilidad laboral, la apertura económica, obligan a formar profesionales polivalentes capaces de adaptarse a las nuevas situaciones socioeconómicas, laborales y organizativas del sector.\n5. La adaptación a las directivas europeas y nacionales sobre la gestión de residuos implicará la puesta en marcha de procedimientos que permitan el aprovechamiento de los recursos en condiciones de seguridad, calidad y respeto al medio ambiente.",
        "article_9": "Los objetivos generales de este ciclo formativo son los siguientes:",
        "article_9_og": [
            {"id": "a", "desc": "Identificar los elementos de las infraestructuras, instalaciones y equipos, analizando planos y esquemas y reconociendo los materiales y procedimientos previstos, para establecer la logística asociada al montaje y mantenimiento."},
            {"id": "b", "desc": "Elaborar croquis y esquemas, empleando medios y técnicas de dibujo y representación simbólica normalizada, para configurar y calcular la instalación."},
            {"id": "c", "desc": "Obtener los parámetros típicos de las instalaciones y equipos, aplicando procedimientos de cálculo y atendiendo a las especificaciones y prescripciones reglamentarias, para configurar y calcular la instalación."},
            {"id": "d", "desc": "Valorar el coste de los materiales y mano de obra, consultando catálogos y unidades de obra, para elaborar el presupuesto del montaje o mantenimiento."},
            {"id": "e", "desc": "Seleccionar el utillaje, herramientas, equipos y medios de montaje y de seguridad, analizando las condiciones de obra y considerando las operaciones a realizar, para acopiar los recursos y medios."},
            {"id": "f", "desc": "Identificar y marcar la posición de los elementos de la instalación o equipo y el trazado de los circuitos, relacionando los planos de la documentación técnica con su ubicación real, para replantear la instalación."},
            {"id": "g", "desc": "Identificar, ensamblar e interconectar periféricos y componentes, atendiendo a las especificaciones técnicas, para montar o ampliar equipos informáticos y periféricos."},
            {"id": "h", "desc": "Reconocer y ejecutar los procedimientos de instalación y carga de programas, siguiendo las especificaciones del fabricante y aplicando criterios de calidad, para instalar y configurar software base, sistemas operativos y aplicaciones."},
            {"id": "i", "desc": "Aplicar técnicas de mecanizado, conexión, medición y montaje, manejando los equipos, herramientas e instrumentos, según procedimientos establecidos y en condiciones de calidad y seguridad, para efectuar el montaje o mantenimiento de los elementos componentes de infraestructuras."},
            {"id": "j", "desc": "Ubicar y fijar los equipos y elementos soporte y auxiliares, interpretando los planos y especificaciones de montaje, en condiciones de seguridad y calidad, para montar equipos, instalaciones e infraestructuras."},
            {"id": "k", "desc": "Conectar los equipos y elementos auxiliares mediante técnicas de conexión y empalme, de acuerdo con los esquemas de la documentación técnica, para montar las infraestructuras y para instalar los equipos."},
            {"id": "l", "desc": "Cargar o volcar programas siguiendo las instrucciones del fabricante y aplicando criterios de calidad para instalar equipos."},
            {"id": "m", "desc": "Analizar y localizar los efectos y causas de disfunción o avería en las instalaciones y equipos, utilizando equipos de medida e interpretando los resultados, para mantener y reparar instalaciones y equipos."},
            {"id": "n", "desc": "Comprobar la configuración y el software de control de los equipos siguiendo las instrucciones del fabricante, para mantener y reparar instalaciones y equipos."},
            {"id": "o", "desc": "Sustituir los elementos defectuosos desmontando y montando los equipos y realizando los ajustes necesarios, analizando planes de mantenimiento y protocolos de calidad y seguridad, para mantener y reparar instalaciones y equipos."},
            {"id": "p", "desc": "Comprobar el conexionado, software, señales y parámetros característicos, utilizando la instrumentación y protocolos establecidos, en condiciones de calidad y seguridad, para verificar el funcionamiento de la instalación o equipo."},
            {"id": "q", "desc": "Cumplimentar fichas de mantenimiento, informes de montaje y reparación y manuales de instrucciones, siguiendo los procedimientos y formatos establecidos, para elaborar la documentación de la instalación o equipo."},
            {"id": "r", "desc": "Analizar y describir los procedimientos de calidad, prevención de riesgos laborales y medioambientales, señalando las acciones que es preciso realizar en los casos definidos para actuar de acuerdo con las normas estandarizadas."},
            {"id": "s", "desc": "Mantener comunicaciones efectivas con su grupo de trabajo, interpretando y generando instrucciones, proponiendo soluciones ante contingencias y coordinando las actividades de los miembros del grupo con actitud abierta y flexible."},
            {"id": "t", "desc": "Resolver problemas y tomar decisiones individuales siguiendo las normas y procedimientos establecidos, definidos dentro del ámbito de su competencia."}
        ]
    }

    db.commit()
    print("Seeded BOA articles for ELE203 (with article_9 OG and article_5 CPPS)")

if __name__ == "__main__":
    seed()
