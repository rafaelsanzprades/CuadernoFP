"""Compare OG from BOE (Actividades Ecuestres) vs DB (ELE203 Telecomunicaciones)"""
import json

# Load parsed OG from BOE (Actividades Ecuestres - RD 652/2017)
with open("temp_ele203_og_parsed.json", encoding="utf-8") as f:
    boe_og = json.load(f)

# Filter only real OG items (single letter, a-w)
real_og = [item for item in boe_og if len(item["letter"]) == 1 and item["letter"].isalpha()]

# DB OG for ELE203 (Telecomunicaciones) from seed script
db_og = [
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

# Build comparison
lines = []
lines.append("=" * 70)
lines.append("COMPARISON: BOE OG (Actividades Ecuestres) vs DB OG (Telecomunicaciones)")
lines.append("=" * 70)
lines.append("")
lines.append(f"BOE OG count: {len(real_og)} (Actividades Ecuestres - RD 652/2017)")
lines.append(f"DB OG count: {len(db_og)} (Telecomunicaciones - ELE203)")
lines.append("")
lines.append("CONCLUSION: These are DIFFERENT degrees with DIFFERENT OG!")
lines.append("ELE203 in DB = Telecomunicaciones")
lines.append("ELE203 in CSV = Actividades Ecuestres (same code, different title)")
lines.append("")

lines.append("=" * 70)
lines.append("BOE OG (Actividades Ecuestres):")
lines.append("=" * 70)
for item in real_og:
    lines.append(f"({item['letter']}) {item['text'][:150]}")

lines.append("")
lines.append("=" * 70)
lines.append("DB OG (Telecomunicaciones):")
lines.append("=" * 70)
for item in db_og:
    lines.append(f"({item['id']}) {item['desc'][:150]}")

# Write to file
with open("temp_ele203_final_comparison.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print("Comparison done. Check temp_ele203_final_comparison.txt")
