"""
Seed BOA articles for ELE304 (Sistemas de Telecomunicaciones e Informáticos - GS)
Based on ORDEN de 21 de junio de 2012 (BOA) - same structure as ELE203.
"""
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database import SessionLocal
from models import Degree

def seed():
    db = SessionLocal()
    degree = db.query(Degree).filter(Degree.code == "ELE304").first()
    if not degree:
        print("Degree ELE304 not found!")
        return

    degree.boa_articles = {
        "article_1": "1. La presente orden tiene por objeto establecer, para la Comunidad Autónoma de Aragón, el currículo del título de Técnico Superior en Sistemas de Telecomunicaciones e Informáticos determinado por el Real Decreto 883/2011, de 24 de junio.\n2. Este currículo se aplicará en los centros educativos que desarrollen las enseñanzas del ciclo formativo correspondientes al título de Técnico Superior en Sistemas de Telecomunicaciones e Informáticos en Aragón.",

        "article_2": "El título de Técnico Superior en Sistemas de Telecomunicaciones e Informáticos queda identificado por los siguientes elementos:\nDenominación: Sistemas de Telecomunicaciones e Informáticos.\nNivel: Formación Profesional de Grado Superior.\nDuración: 2000 horas.\nFamilia Profesional: Electricidad y Electrónica.\nReferente europeo: CINE-5b (Clasificación Internacional Normalizada de la Educación).",

        "article_3": "El perfil profesional del título de Técnico Superior en Sistemas de Telecomunicaciones e Informáticos queda determinado por su competencia general, sus competencias profesionales, personales y sociales, y por la relación de cualificaciones y, en su caso, unidades de competencia del Catálogo Nacional de Cualificaciones Profesionales incluidas en el título.",

        "article_4": "La competencia general de este título consiste en desarrollar proyectos, así como gestionar y supervisar el montaje y mantenimiento de las infraestructuras comunes de telecomunicaciones y de sistemas y equipos de telecomunicaciones tales como redes de banda ancha y de radiocomunicaciones fijas y móviles, sistemas telemáticos, de producción audiovisual y de transmisión, a partir de la documentación técnica, normativa y procedimientos establecidos, asegurando el funcionamiento, la calidad, la seguridad y la conservación medioambiental.",

        "article_5": "Las competencias profesionales, personales y sociales de este título son las que se relacionan a continuación:",

        "article_5_cpps": [
            {"id": "a", "desc": "Desarrollar proyectos de instalaciones o sistemas de telecomunicaciones, obteniendo datos y características, para la elaboración de informes y especificaciones."},
            {"id": "b", "desc": "Calcular los parámetros de equipos, elementos e instalaciones, cumpliendo la normativa vigente y los requerimientos del cliente."},
            {"id": "c", "desc": "Elaborar el presupuesto de la instalación, cotejando los aspectos técnicos y económicos para ofrecer la mejor solución al cliente."},
            {"id": "d", "desc": "Configurar instalaciones y sistemas de telecomunicación, con las especificaciones y las prescripciones reglamentarias."},
            {"id": "e", "desc": "Gestionar el suministro y almacenamiento de los materiales y equipos, definiendo la logística asociada y controlando existencias."},
            {"id": "f", "desc": "Planificar el montaje de instalaciones y sistemas de telecomunicaciones según la documentación técnica y las condiciones de obra."},
            {"id": "g", "desc": "Realizar el lanzamiento del montaje de las instalaciones, partiendo del programa de montaje y del plan general de obra."},
            {"id": "h", "desc": "Supervisar y/o ejecutar los procesos de montaje de las instalaciones y sistemas, verificando su adecuación a las condiciones de obra y controlando su avance para cumplir con los objetivos de la empresa."},
            {"id": "i", "desc": "Planificar el mantenimiento a partir de la normativa, condiciones de la instalación y recomendaciones de los fabricantes."},
            {"id": "j", "desc": "Supervisar y/o ejecutar los procesos de mantenimiento de las instalaciones, controlando los tiempos y la calidad de los resultados."},
            {"id": "k", "desc": "Realizar la puesta en servicio de las instalaciones y equipos de telecomunicaciones, supervisando el cumplimiento de los requerimientos y asegurando las condiciones de calidad y seguridad."},
            {"id": "l", "desc": "Elaborar el estudio básico de seguridad y salud para la ejecución de las instalaciones, determinando las medidas de protección, seguridad y prevención de riesgos."},
            {"id": "m", "desc": "Adaptarse a las nuevas situaciones laborales, manteniendo actualizados los conocimientos científicos, técnicos y tecnológicos relativos a su entorno profesional, gestionando su formación y los recursos existentes en el aprendizaje a lo largo de la vida y utilizando las tecnologías de la información y la comunicación."},
            {"id": "n", "desc": "Resolver situaciones, problemas o contingencias con iniciativa y autonomía en el ámbito de su competencia, con creatividad, innovación y espíritu de mejora en el trabajo personal y en el de los miembros del equipo."},
            {"id": "ñ", "desc": "Organizar y coordinar equipos de trabajo con responsabilidad, supervisando el desarrollo del mismo, manteniendo relaciones fluidas y asumiendo el liderazgo, así como aportando soluciones a los conflictos grupales que se presentan."},
            {"id": "o", "desc": "Comunicarse con sus iguales, superiores, clientes y personas bajo su responsabilidad, utilizando vías eficaces de comunicación, transmitiendo la información o conocimientos adecuados y respetando la autonomía y competencia de las personas que intervienen en el ámbito de su trabajo."},
            {"id": "p", "desc": "Generar entornos seguros en el desarrollo de su trabajo y el de su equipo, supervisando y aplicando los procedimientos de prevención de riesgos laborales y ambientales, de acuerdo con lo establecido por la normativa y los objetivos de la empresa."},
            {"id": "q", "desc": "Supervisar y aplicar procedimientos de gestión de calidad, de accesibilidad universal y de «diseño para todos» en las actividades profesionales incluidas en los procesos de producción o prestación de servicios."},
            {"id": "r", "desc": "Realizar la gestión básica para la creación y funcionamiento de una pequeña empresa y tener iniciativa en su actividad profesional con sentido de la responsabilidad social."},
            {"id": "s", "desc": "Ejercer sus derechos y cumplir con las obligaciones derivadas de su actividad profesional, de acuerdo con lo establecido en la legislación vigente, participando activamente en la vida económica, social y cultural."}
        ],

        "article_6": "1. Cualificaciones profesionales completas:\na) Gestión y supervisión del montaje y mantenimiento de las infraestructuras de telecomunicación y de redes de voz y datos en el entorno de edificios ELE383_3 (Real Decreto 328/2008, de 29 de febrero), que comprende las siguientes unidades de competencia: UC1184_3, UC1185_3, UC1186_3, UC1187_3.\nb) Gestión y supervisión del montaje y mantenimiento de sistemas de producción audiovisual y de radiodifusión ELE487_3 (Real Decreto 144/2011, de 4 de febrero), que comprende las siguientes unidades de competencia: UC1578_3, UC1579_3, UC1580_3, UC1581_3.\nc) Desarrollo de proyectos de infraestructuras de telecomunicación y de redes de voz y datos en el entorno de edificios ELE258_3 (Real Decreto 1115/2007, de 24 de agosto), que comprende las siguientes unidades de competencia: UC0826_3, UC0827_3, UC0828_3.",

        "article_6_cps": [
            {"id": "a", "code": "ELE383_3", "ref": "R.D. 328/2008, de 29 de febrero", "desc": "Gestión y supervisión del montaje y mantenimiento de las infraestructuras de telecomunicación y de redes de voz y datos en el entorno de edificios"},
            {"id": "b", "code": "ELE487_3", "ref": "R.D. 144/2011, de 4 de febrero", "desc": "Gestión y supervisión del montaje y mantenimiento de sistemas de producción audiovisual y de radiodifusión"},
            {"id": "c", "code": "ELE258_3", "ref": "R.D. 1115/2007, de 24 de agosto", "desc": "Desarrollo de proyectos de infraestructuras de telecomunicación y de redes de voz y datos en el entorno de edificios"}
        ],

        "article_6_ucs": [
            {"id": "UC1184_3", "cp_id": "a", "desc": "Organizar y gestionar el montaje de las infraestructuras de telecomunicación y de redes de voz y datos en el entorno de edificios."},
            {"id": "UC1185_3", "cp_id": "a", "desc": "Supervisar el montaje de las infraestructuras de telecomunicación y de redes de voz y datos en el entorno de edificios."},
            {"id": "UC1186_3", "cp_id": "a", "desc": "Organizar y gestionar el mantenimiento de las infraestructuras de telecomunicación y de redes de voz y datos en el entorno de edificios."},
            {"id": "UC1187_3", "cp_id": "a", "desc": "Supervisar el mantenimiento de las infraestructuras de telecomunicación y de redes de voz y datos en el entorno de edificios."},
            {"id": "UC1578_3", "cp_id": "b", "desc": "Gestionar y supervisar el montaje de sistemas de producción audiovisual en estudios y unidades móviles."},
            {"id": "UC1579_3", "cp_id": "b", "desc": "Gestionar y supervisar el mantenimiento de sistemas de producción audiovisual en estudios y unidades móviles."},
            {"id": "UC1580_3", "cp_id": "b", "desc": "Gestionar y supervisar el montaje de sistemas de transmisión para radio y televisión en instalaciones fijas y unidades móviles."},
            {"id": "UC1581_3", "cp_id": "b", "desc": "Gestionar y supervisar el mantenimiento de sistemas de transmisión para radio y televisión en instalaciones fijas y unidades móviles."},
            {"id": "UC0826_3", "cp_id": "c", "desc": "Desarrollar proyectos de instalaciones de telecomunicación para la recepción y distribución de señales de radio y televisión en el entorno de edificios."},
            {"id": "UC0827_3", "cp_id": "c", "desc": "Desarrollar proyectos de instalaciones de telefonía en el entorno de edificios."},
            {"id": "UC0828_3", "cp_id": "c", "desc": "Desarrollar proyectos de infraestructuras de redes de voz y datos en el entorno de edificios."}
        ],

        "article_7": "1. Este profesional ejerce su actividad en empresas del sector servicios, tanto privadas como públicas, dedicadas a las telecomunicaciones, integración de sistemas, redes de banda ancha, telemática y medios audiovisuales, como desarrollador de proyectos, integrador de sistemas y supervisor del montaje y mantenimiento de las instalaciones e infraestructuras, bien por cuenta propia o ajena.\n2. Las ocupaciones y puestos de trabajo más relevantes son los siguientes:\na) Ayudante de proyectista en instalaciones de telecomunicaciones para viviendas y edificios.\nb) Supervisor del montaje de instalaciones de telecomunicaciones para viviendas y edificios.\nc) Técnico en verificación y control de equipos e instalaciones de telecomunicaciones.\nd) Especialista en instalación, integración y mantenimiento de equipos y sistemas de telecomunicación.\ne) Jefe de obra en instalaciones de telecomunicaciones.\nf) Técnico en supervisión, instalación, verificación y control de equipos de sistemas de radio y televisión en estudios de producción y sistemas de producción audiovisual.\ng) Técnico en supervisión, instalación, mantenimiento, verificación y control de equipos de sistemas de radiodifusión.\nh) Técnico en supervisión, instalación, mantenimiento, verificación y control de equipos de sistemas de seguridad electrónica y circuitos cerrados de televisión.\ni) Técnico en supervisión, instalación, mantenimiento, verificación y control en redes locales y sistemas telemáticos.\nj) Técnico en supervisión, instalación, mantenimiento, verificación y control en sistemas de radioenlaces.\nk) Especialista en integración, instalación y mantenimiento de equipos y sistemas informáticos.",

        "article_8": "1. El perfil profesional de este título, dentro del sector terciario, evoluciona hacia un técnico superior con gran especialización en la supervisión, instalación y mantenimiento de infraestructuras de telecomunicaciones, sistemas de seguridad electrónica, redes de comunicación, hogar digital, telefonía, sonido e imagen y sistemas informáticos, con un incremento en el desempeño de funciones de gestión, planificación, calidad y prevención de riesgos laborales.\n2. El desarrollo de las tecnologías de la información, como resultado de la convergencia de la informática y las telecomunicaciones, se fundamenta principalmente en la fibra óptica y las redes de comunicación inalámbricas, para el tránsito de cualquier tipo de información. La integración de equipos y sistemas, tanto informáticos como de telecomunicación, conlleva un cambio en los procesos tradicionales de planificación, instalación y mantenimiento en cuanto a las nuevas tecnologías, cuyo objetivo es optimizar las comunicaciones entre usuarios.\n3. Será necesaria la utilización de técnicas y procedimientos concretos para la integración de estos sistemas, así como el uso de equipamiento de comprobación y medida específico.\n4. Las estructuras organizativas tienden a configurarse sobre la base de decisiones descentralizadas y equipos participativos de gestión, potenciando la autonomía y capacidad de decisión.\n5. Las características del mercado de trabajo, la movilidad laboral y la apertura económica obligan a formar profesionales polivalentes capaces de adaptarse a las nuevas situaciones socioeconómicas, laborales y organizativas del sector.\n6. La adaptación a las directivas europeas y nacionales sobre la gestión de residuos implicará la puesta en marcha de procedimientos que permitan el aprovechamiento de los recursos en condiciones de seguridad, calidad y respeto al medio ambiente.",

        "article_9": "Los objetivos generales de este ciclo formativo son los siguientes:",

        "article_9_og": [
            {"id": "a", "desc": "Elaborar informes y documentación técnica, reconociendo los elementos y sistemas de telecomunicaciones, para desarrollar proyectos de instalaciones o sistemas de telecomunicaciones."},
            {"id": "b", "desc": "Reconocer sistemas de telecomunicaciones, aplicando leyes y teorías fundamentales, para calcular los parámetros de equipos, elementos e instalaciones."},
            {"id": "c", "desc": "Definir unidades de obra y sus características técnicas, identificando los componentes de la instalación, para elaborar el presupuesto."},
            {"id": "d", "desc": "Definir la estructura, equipos y conexionado general de las instalaciones y sistemas de telecomunicaciones, aplicando la normativa vigente, para configurarlos."},
            {"id": "e", "desc": "Dibujar los planos de trazado general y esquemas eléctricos, empleando medios y técnicas de dibujo y representación normalizada, para configurar instalaciones y sistemas de telecomunicación."},
            {"id": "f", "desc": "Gestionar el suministro y almacenamiento de materiales y equipos, definiendo la logística asociada y controlando existencias, para planificar el montaje."},
            {"id": "g", "desc": "Elaborar el programa de montaje y el plan general de obra, analizando la documentación técnica y las condiciones de obra, para realizar el lanzamiento del montaje."},
            {"id": "h", "desc": "Supervisar los procesos de montaje de las instalaciones y sistemas, verificando su adecuación a las condiciones de obra y controlando su avance, para cumplir con los objetivos de la empresa."},
            {"id": "i", "desc": "Planificar el mantenimiento a partir de la normativa, condiciones de la instalación y recomendaciones de los fabricantes, para supervisar y/o ejecutar los procesos de mantenimiento."},
            {"id": "j", "desc": "Supervisar los procesos de mantenimiento de las instalaciones, controlando los tiempos y la calidad de los resultados, para asegurar el funcionamiento de los sistemas."},
            {"id": "k", "desc": "Realizar la puesta en servicio de las instalaciones y equipos de telecomunicaciones, supervisando el cumplimiento de los requerimientos y asegurando las condiciones de calidad y seguridad."},
            {"id": "l", "desc": "Elaborar el estudio básico de seguridad y salud para la ejecución de las instalaciones, determinando las medidas de protección, seguridad y prevención de riesgos."},
            {"id": "m", "desc": "Analizar y describir los procedimientos de calidad, prevención de riesgos laborales y medioambientales, señalando las acciones que es preciso realizar en los casos definidos, para actuar de acuerdo con las normas estandarizadas."},
            {"id": "n", "desc": "Mantener comunicaciones efectivas con su grupo de trabajo, interpretando y generando instrucciones, proponiendo soluciones ante contingencias y coordinando las actividades de los miembros del grupo con actitud abierta y flexible."},
            {"id": "ñ", "desc": "Organizar y coordinar equipos de trabajo con responsabilidad, supervisando el desarrollo del mismo, manteniendo relaciones fluidas y asumiendo el liderazgo, así como aportando soluciones a los conflictos grupales que se presentan."},
            {"id": "o", "desc": "Comunicarse con sus iguales, superiores, clientes y personas bajo su responsabilidad, utilizando vías eficaces de comunicación, transmitiendo la información o conocimientos adecuados y respetando la autonomía y competencia de las personas que intervienen en el ámbito de su trabajo."},
            {"id": "p", "desc": "Generar entornos seguros en el desarrollo de su trabajo y el de su equipo, supervisando y aplicando los procedimientos de prevención de riesgos laborales y ambientales, de acuerdo con lo establecido por la normativa y los objetivos de la empresa."},
            {"id": "q", "desc": "Supervisar y aplicar procedimientos de gestión de calidad, de accesibilidad universal y de «diseño para todos» en las actividades profesionales incluidas en los procesos de producción o prestación de servicios."},
            {"id": "r", "desc": "Realizar la gestión básica para la creación y funcionamiento de una pequeña empresa y tener iniciativa en su actividad profesional con sentido de la responsabilidad social."},
            {"id": "s", "desc": "Ejercer sus derechos y cumplir con las obligaciones derivadas de su actividad profesional, de acuerdo con lo establecido en la legislación vigente, participando activamente en la vida económica, social y cultural."},
            {"id": "t", "desc": "Resolver situaciones, problemas o contingencias con iniciativa y autonomía en el ámbito de su competencia, con creatividad, innovación y espíritu de mejora en el trabajo personal y en el de los miembros del equipo."},
            {"id": "u", "desc": "Adaptarse a las nuevas situaciones laborales, manteniendo actualizados los conocimientos científicos, técnicos y tecnológicos relativos a su entorno profesional, gestionando su formación y los recursos existentes en el aprendizaje a lo largo de la vida."},
            {"id": "v", "desc": "Utilizar las tecnologías de la información y la comunicación para mejorar los procesos de gestión, planificación y supervisión de las instalaciones de telecomunicaciones."},
            {"id": "w", "desc": "Desarrollar la creatividad y el espíritu de innovación para proponer mejoras en los procesos de montaje y mantenimiento de las instalaciones de telecomunicaciones."},
            {"id": "x", "desc": "Gestionar su carrera profesional, analizando las oportunidades de empleo, autoempleo y de aprendizaje, con una actitud responsable y comprometida."},
            {"id": "y", "desc": "Crear y gestionar una pequeña empresa, realizando un estudio de viabilidad de productos, de planificación de la producción y de comercialización, con una actitud emprendedora."}
        ]
    }

    db.commit()
    print("Seeded BOA articles for ELE304 (articles 1-9 with CPPS, CPs, UCs, OGs)")

if __name__ == "__main__":
    seed()
