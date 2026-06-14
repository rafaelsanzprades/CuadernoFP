import sqlite3
import json

db_path = 'cdd_pro.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

uds = [
    {"id_ud": "UD01", "horas_ud": 10, "desc_ud": "Normativa ICT y zonas comunes", "RA1": 15},
    {"id_ud": "UD02", "horas_ud": 10, "desc_ud": "Elementos de las instalaciones ICT", "RA1": 15},
    {"id_ud": "UD03", "horas_ud": 15, "desc_ud": "Antenas y líneas para RTV", "RA1": 10},
    {"RA1": 5, "RA2": 0, "RA3": 0, "RA4": 0, "RA5": 0, "RA6": 0, "RA7": 0, "id_ud": "UD04", "horas_ud": 10, "desc_ud": "Equipos de procesado y distribución RTV"}, 
    {"RA1": 0, "RA2": 10, "RA3": 0, "RA4": 0, "RA5": 0, "RA6": 0, "RA7": 0, "id_ud": "UD05", "horas_ud": 15, "desc_ud": "Config.inst. RTV (I): distribución captación"}, 
    {"RA1": 0, "RA2": 5, "RA3": 0, "RA4": 0, "RA5": 0, "RA6": 0, "RA7": 0, "id_ud": "UD06", "horas_ud": 10, "desc_ud": "Config.inst. RTV (II): cabeceras TV-SAT"}, 
    {"RA1": 0, "RA2": 0, "RA3": 5, "RA4": 0, "RA5": 0, "RA6": 0, "RA7": 0, "id_ud": "UD07", "horas_ud": 10, "desc_ud": "Montaje de sistemas de recepción RTV en ICT"}, 
    {"RA1": 0, "RA2": 0, "RA3": 0, "RA4": 5, "RA5": 0, "RA6": 0, "RA7": 0, "id_ud": "UD08", "horas_ud": 10, "desc_ud": "Verificación y ajustes en instalaciones en RTV"}, 
    {"RA1": 10, "RA2": 0, "RA3": 0, "RA4": 0, "RA5": 0, "RA6": 0, "RA7": 0, "id_ud": "UD09", "horas_ud": 15, "desc_ud": "Instalaciones de telefonía en ICT"}, 
    {"RA1": 5, "RA2": 0, "RA3": 0, "RA4": 0, "RA5": 0, "RA6": 0, "RA7": 0, "id_ud": "UD10", "horas_ud": 10, "desc_ud": "Instalaciones de interfonía y control de acceso"}, 
    {"RA1": 0, "RA2": 0, "RA3": 0, "RA4": 0, "RA5": 5, "RA6": 5, "RA7": 5, "id_ud": "UD11", "horas_ud": 15, "desc_ud": "Mantenimiento de instalaciones de ICT"}
]

for ud in uds:
    ra_mappings = {k: v for k, v in ud.items() if k.startswith('RA')}
    cursor.execute("""
        INSERT INTO didactic_units (module_document_id, id_ud, desc_ud, horas_ud, ra_mappings)
        VALUES (?, ?, ?, ?, ?)
    """, ("0237-ictve-pd", ud["id_ud"], ud["desc_ud"], ud["horas_ud"], json.dumps(ra_mappings)))

conn.commit()
print("Restored!")
