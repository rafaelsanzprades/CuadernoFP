import sqlite3, json

conn = sqlite3.connect('cdd_pro.db')
cur = conn.cursor()

cur.execute('SELECT boa_articles FROM degrees WHERE code = ?', ('ELE304',))
row = cur.fetchone()
boa = json.loads(row[0]) if row and row[0] else {}

boa['article_9'] = 'Los objetivos generales de este ciclo formativo son los siguientes:'
boa['article_9_og'] = [
    {"id": "a", "desc": "Elaborar informes y documentaci\u00f3n t\u00e9cnica, reconociendo esquemas y consultando cat\u00e1logos y las prescripciones reglamentarias, para desarrollar proyectos de instalaciones y sistemas de telecomunicaciones."},
    {"id": "b", "desc": "Reconocer sistemas de telecomunicaciones, aplicando leyes y teoremas para calcular sus par\u00e1metros."},
    {"id": "c", "desc": "Definir unidades de obra y sus caracter\u00edsticas t\u00e9cnicas, interpretando planos y esquemas, para elaborar el presupuesto."},
    {"id": "d", "desc": "Definir la estructura, equipos y conexionado general de las instalaciones y sistemas de telecomunicaciones, partiendo de los c\u00e1lculos y utilizando cat\u00e1logos comerciales, para configurar instalaciones."},
    {"id": "e", "desc": "Dibujar los planos de trazado general y esquemas el\u00e9ctricos y electr\u00f3nicos, utilizando programas inform\u00e1ticos de dise\u00f1o asistido, para configurar instalaciones y sistemas de telecomunicaciones."},
    {"id": "f", "desc": "Aplicar t\u00e9cnicas de control de almac\u00e9n, utilizando programas inform\u00e1ticos, para gestionar el suministro."},
    {"id": "g", "desc": "Definir las fases y actividades del desarrollo de la instalaci\u00f3n seg\u00fan documentaci\u00f3n t\u00e9cnica pertinente, especificando los recursos necesarios, para planificar el montaje."},
    {"id": "h", "desc": "Replantear la instalaci\u00f3n, teniendo en cuenta los planos y esquemas y las posibles condiciones de la instalaci\u00f3n, para realizar el lanzamiento."},
    {"id": "i", "desc": "Identificar los recursos humanos y materiales, dando respuesta a las necesidades del montaje, para realizar su lanzamiento."},
    {"id": "j", "desc": "Aplicar t\u00e9cnicas de gesti\u00f3n y montaje en sistemas de telecomunicaciones, interpretando anteproyectos e utilizando instrumentos y herramientas adecuadas, para supervisar el montaje."},
    {"id": "k", "desc": "Definir procedimientos, operaciones y secuencias de intervenci\u00f3n en instalaciones de telecomunicaciones, analizando informaci\u00f3n t\u00e9cnica de equipos y recursos, para planificar el mantenimiento."},
    {"id": "l", "desc": "Aplicar t\u00e9cnicas de mantenimiento en sistemas e instalaciones de telecomunicaciones, utilizando los instrumentos y herramientas apropiados, para ejecutar los procesos de mantenimiento."},
    {"id": "m", "desc": "Ejecutar pruebas de funcionamiento, ajustando equipos y elementos, para poner en servicio las instalaciones."},
    {"id": "n", "desc": "Definir los medios de protecci\u00f3n personal y de las instalaciones, identificando los riesgos y factores de riesgo del montaje, mantenimiento y uso de las instalaciones, para elaborar el estudio b\u00e1sico de seguridad y salud."},
    {"id": "\u00f1", "desc": "Reconocer la normativa de gesti\u00f3n de calidad y de residuos aplicada a las instalaciones de telecomunicaciones y el\u00e9ctricas, para supervisar el cumplimiento de la normativa."},
    {"id": "o", "desc": "Preparar los informes t\u00e9cnicos, certificados de instalaci\u00f3n y manuales de instrucciones y mantenimiento, siguiendo los procedimientos y formatos oficiales para elaborar la documentaci\u00f3n t\u00e9cnica y administrativa."},
    {"id": "p", "desc": "Analizar y utilizar los recursos y oportunidades de aprendizaje relacionadas con la evoluci\u00f3n cient\u00edfica, tecnol\u00f3gica y organizativa del sector y las tecnolog\u00edas de la informaci\u00f3n y la comunicaci\u00f3n, para mantener el esp\u00edritu de actualizaci\u00f3n y adaptarse a nuevas situaciones laborales y personales."},
    {"id": "q", "desc": "Desarrollar la creatividad y el esp\u00edritu de innovaci\u00f3n para responder a los retos que se presentan en los procesos y en la organizaci\u00f3n del trabajo y de la vida personal."},
    {"id": "r", "desc": "Tomar decisiones de forma fundamentada, analizando las variables implicadas, integrando saberes de distinto \u00e1mbito y aceptando los riesgos y la posibilidad de equivocaci\u00f3n en las mismas, para afrontar y resolver distintas situaciones, problemas o contingencias."},
    {"id": "s", "desc": "Desarrollar t\u00e9cnicas de liderazgo, motivaci\u00f3n, supervisi\u00f3n y comunicaci\u00f3n en contextos de trabajo en grupo, para facilitar la organizaci\u00f3n y coordinaci\u00f3n de equipos de trabajo."},
    {"id": "t", "desc": "Aplicar estrategias y t\u00e9cnicas de comunicaci\u00f3n, adapt\u00e1ndose a los contenidos que se van a transmitir, a la finalidad y a las caracter\u00edsticas de los receptores, para asegurar la eficacia en los procesos de comunicaci\u00f3n."},
    {"id": "u", "desc": "Evaluar situaciones de prevenci\u00f3n de riesgos laborales y de protecci\u00f3n ambiental, proponiendo y aplicando medidas de prevenci\u00f3n personales y colectivas, de acuerdo con la normativa aplicable en los procesos del trabajo, para garantizar entornos seguros."},
    {"id": "v", "desc": "Identificar y proponer las acciones profesionales necesarias, para dar respuesta a la accesibilidad universal y al \u00abdise\u00f1o para todos\u00bb."},
    {"id": "w", "desc": "Identificar y aplicar par\u00e1metros de calidad en los trabajos y actividades realizados en el proceso de aprendizaje, para valorar la cultura de la evaluaci\u00f3n y de la calidad y ser capaces de supervisar y mejorar los procedimientos de gesti\u00f3n de calidad."},
    {"id": "x", "desc": "Utilizar procedimientos relacionados con la cultura emprendedora, empresarial y de iniciativa profesional, para realizar la gesti\u00f3n b\u00e1sica de una peque\u00f1a empresa o emprender un trabajo."},
    {"id": "y", "desc": "Reconocer sus derechos y deberes como agente activo en la sociedad, teniendo en cuenta el marco legal que regula las condiciones sociales y laborales, para participar como ciudadano democr\u00e1tico."}
]

cur.execute('UPDATE degrees SET boa_articles = ? WHERE code = ?', (json.dumps(boa, ensure_ascii=False), 'ELE304'))
conn.commit()
print(f'Updated ELE304: {cur.rowcount} rows, {len(boa["article_9_og"])} OGs')

# Verify
cur.execute('SELECT boa_articles FROM degrees WHERE code = ?', ('ELE304',))
row2 = cur.fetchone()
boa2 = json.loads(row2[0])
print(f'Verify: article_9_og count = {len(boa2.get("article_9_og", []))}')
for og in boa2['article_9_og']:
    print(f'  OG{og["id"]}: {og["desc"][:70]}...')

conn.close()
