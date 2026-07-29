import json

def update_file(filepath, descriptions):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        for i, ud in enumerate(data.get('df_ud', [])):
            if i < len(descriptions):
                ud['desc_ud'] = descriptions[i]
            else:
                ud['desc_ud'] = f"Unidad didáctica {i+1}"
                
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f'Successfully updated {filepath}')
    except Exception as e:
        print(f'Error updating {filepath}: {e}')

ictve_uds = [
    "Introducción a las ICT y normativa",
    "Elementos de captación de señales de radiodifusión",
    "Sistemas y equipos de cabecera",
    "Redes de distribución y dispersión",
    "Sistemas de telefonía básica en edificios",
    "Redes de banda ancha y cable coaxial",
    "Sistemas de control de accesos y videoporteros",
    "Instalación y configuración de infraestructuras",
    "Mantenimiento y resolución de averías en ICT",
    "Prevención de riesgos laborales en telecomunicaciones",
    "Proyecto de ICT y documentación técnica"
]

ofimatica_uds = [
    "Introducción al entorno del sistema operativo",
    "Procesadores de texto: operaciones básicas",
    "Procesadores de texto: formato y herramientas avanzadas",
    "Hojas de cálculo: entorno y conceptos básicos",
    "Hojas de cálculo: fórmulas, funciones y gráficos",
    "Gestión de bases de datos relacionales",
    "Elaboración de presentaciones gráficas",
    "Herramientas de correo electrónico y agenda"
]

update_file('frontend/public/demo/0237.fpp.json', ictve_uds)
update_file('frontend/public/demo/0223.fpp.json', ofimatica_uds)
