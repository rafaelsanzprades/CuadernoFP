# -*- coding: utf-8 -*-
"""Add desc_ra to DEMO seed."""
import sys
sys.stdout.reconfigure(encoding='utf-8')

path = '../frontend/src/services/demo-ele203-0237ictve-curso202526.ts'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

ra_descs = {
    'RA1': 'Integra el controlador lógico programable (plc) en un sistema sencillo a automatizar, conexionándolo, adaptando y/o elaborando programas de control',
    'RA2': 'Identifica los sistemas de supervisión en el sistema a automatizar, describiendo su conexión y elaborando o modificando los programas de control',
    'RA3': 'Utiliza variadores de velocidad (convertidor de frecuencia) para motores, realizando su conexionado dentro de los sistemas sencillos y elaborando o modificando los programas de control',
    'RA4': 'Mantiene y repara averías comunes en instalaciones automatizadas, interpretando los fallos y corrigiendo las disfunciones',
    'RA5': 'Programa sistemas de automatización industrial, configurando dispositivos y verificando su funcionamiento',
    'RA6': 'Realiza el mantenimiento preventivo de sistemas automatizados, aplicando protocolos y documentando las intervenciones',
    'RA7': 'Instala y configura redes de comunicación industrial, verificando su correcto funcionamiento',
}

count = 0
for ra_id, desc in ra_descs.items():
    old = f'"id_ra": "{ra_id}",\n                "peso_ra"'
    new = f'"id_ra": "{ra_id}",\n                "desc_ra": "{desc}",\n                "peso_ra"'
    if old in content:
        content = content.replace(old, new, 1)
        count += 1
        print(f'  Added desc_ra for {ra_id}')
    else:
        print(f'  SKIP {ra_id}: pattern not found')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'\nTotal: {count} desc_ra added')
print(f'desc_ra in file: {content.count(chr(34) + "desc_ra" + chr(34))}')
