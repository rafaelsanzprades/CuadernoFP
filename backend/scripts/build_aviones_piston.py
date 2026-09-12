# -*- coding: utf-8 -*-
"""Tecnico Superior en Mantenimiento aeromecanico de aviones con motor de
piston -- RD 1444/2018, de 14 de diciembre (BOE-A-2019-544). Titulo
EASA/AESA (mantenimiento aeronautico): como las otras 2 titulaciones
aeronauticas ya construidas via BOA en esta sesion, NO tiene articulo de
'Cualificaciones y Unidades de Competencia' del Catalogo Nacional -- la
numeracion de articulos se desplaza una posicion respecto al patron
loe_clasica estandar: Art.6=Entorno profesional (normalmente Art.7),
Art.7=Prospectiva (normalmente Art.8), Art.8=Objetivos generales
(normalmente Art.9), Art.9=lista de modulos (sin slot propio en el
esquema). Se remapea al guardar, mismo patron ya usado para
extract_boa_sections() con los titulos BOA (Aragon) de este mismo grupo.

Diferencia importante con el resto del grupo 'aeronauticas BOA': este RD
SI trae las horas por modulo EMBEBIDAS en su propio texto ('Duracion: N
horas.' tras el RA/CE de cada modulo, igual que el RD 1685/2007 de
Audiologia Protesica) -- no hace falta Orden de curriculo ni PDF de BOA. La
investigacion previa de la sesion que declaraba este grupo bloqueado por
falta de fuente de horas solo habia buscado una Orden/BOA separada, sin
comprobar si el propio RD ya las traia."""
import re
import sqlite3
import sys

sys.path.insert(0, ".")
from scripts.build_titulo_nacional import fetch_boe, extract_articles_2_9, extract_lettered, insert_titulo

BOE_ID = "BOE-A-2019-544"

soup = fetch_boe(BOE_ID)
raw_articles = extract_articles_2_9(soup)
print("Articulos crudos (numeracion real del RD):", sorted(raw_articles.keys()))

# Remapeo: este RD no tiene articulo de Cualificaciones -- todo lo que va
# despues del articulo 5 (Competencias) se desplaza una posicion respecto
# al patron estandar del esquema.
articles = {
    2: raw_articles[2],
    3: raw_articles[3],
    4: raw_articles[4],
    5: raw_articles[5],
    7: raw_articles[6],  # Entorno profesional
    8: raw_articles[7],  # Prospectiva del titulo
    9: raw_articles[8],  # Objetivos generales
}
cpps = extract_lettered(articles[5])
og = extract_lettered(articles[9])
cps, ucs = [], []  # No existe articulo de Cualificaciones en este RD (titulo EASA/AESA).
print("CPPS:", len(cpps), "OG:", len(og))

all_tags = soup.find_all(["h5", "p"])
start = end = None
for i, t in enumerate(all_tags):
    if t.name == "h5" and "anexo_tit" in (t.get("class") or []) and re.match(r"^m[oó]dulos profesionales\.?$", t.get_text(strip=True).lower()) and start is None:
        start = i
    elif start is not None and t.name == "h5" and "anexo_num" in (t.get("class") or []) and i > start:
        end = i
        break
assert start is not None and end is not None
print("ANEXO I modulos: tags", start, "a", end)

modules = []
cur_mod = None
cur_ra = None
for tag in all_tags[start + 1:end]:
    if tag.name != "p":
        continue
    txt = tag.get_text(strip=True)
    m_mod = re.match(r"^M[oó]dulo [Pp]rofesional:\s*(.+?)\.?$", txt)
    m_dur = re.match(r"^Duraci[oó]n:?\s*(\d+)\s*horas", txt)
    m_cod = re.match(r"^C[oó]digo[:.]\s*(\S+)", txt)
    m_ra = re.match(r"^(\d+)[.)]\s+(.+)$", txt)
    m_ce = re.match(r"^([a-zñ])\)\s*(.+)$", txt)
    if m_mod:
        if cur_mod:
            modules.append(cur_mod)
        cur_mod = {"name": m_mod.group(1).strip(), "code": None, "ras": [], "hours": None}
        cur_ra = None
    elif m_dur and cur_mod is not None:
        cur_mod["hours"] = int(m_dur.group(1))
    elif m_cod and cur_mod is not None:
        cur_mod["code"] = m_cod.group(1).strip().rstrip(".")
    elif txt.startswith("Resultados de aprendizaje") or txt.startswith("Criterios de evaluaci") or txt.startswith("Equivalencia en cr"):
        continue
    elif m_ra and cur_mod is not None:
        cur_ra = {"ra_number": int(m_ra.group(1)), "desc": m_ra.group(2).strip(), "ces": []}
        cur_mod["ras"].append(cur_ra)
    elif m_ce and cur_ra is not None:
        cur_ra["ces"].append({"letter": m_ce.group(1), "desc": m_ce.group(2).strip()})
if cur_mod:
    modules.append(cur_mod)

hours_by_code = {}
for m in modules:
    hours_by_code[m["code"]] = {"hours": m["hours"], "curso": None}
    print(m["code"], m["name"][:70], "RA:", len(m["ras"]), "horas:", m["hours"])

total_ra = sum(len(m["ras"]) for m in modules)
total_ce = sum(len(ra["ces"]) for m in modules for ra in m["ras"])
total_hours = sum(v["hours"] for v in hours_by_code.values() if v["hours"] is not None)
sin_horas = [m["code"] for m in modules if m["hours"] is None]
print("TOTAL modulos:", len(modules), "RA:", total_ra, "CE:", total_ce)
print("Horas conocidas:", total_hours, "-- modulos SIN horas:", sin_horas)

with sqlite3.connect("cdd_pro.db") as conn:
    dup = conn.execute("SELECT code, name FROM degrees WHERE name LIKE '%iston%' AND name LIKE '%vi%n%'").fetchall()
    print("Posibles duplicados:", dup)
    assert not dup, "Ya existe un titulo de aviones con motor de piston"

    fuente = {
        "generacion": "rd659_2023",
        "rd_numero": "RD 1444/2018",
        "rd_fecha": "2018-12-14",
        "boe_url": f"https://www.boe.es/buscar/act.php?id={BOE_ID}",
        "nota": (
            "Real Decreto 1444/2018, de 14 de diciembre. Titulo EASA/AESA "
            "de mantenimiento aeronautico: no tiene articulo de "
            "Cualificaciones y Unidades de Competencia del Catalogo "
            "Nacional (confirmado, este tipo de titulos no referencia el "
            "catalogo INCUAL) -- la numeracion de articulos del RD se "
            "desplaza una posicion respecto al patron estandar; se ha "
            "remapeado al guardar: el Art.6 real del RD (Entorno "
            "profesional) se guarda como article_7, el Art.7 real "
            "(Prospectiva) como article_8, y el Art.8 real (Objetivos "
            "generales) como article_9 -- no existe article_6 para este "
            "titulo. Las horas por modulo SI vienen embebidas en el propio "
            "texto del RD ('Duracion: N horas.' tras cada modulo), a "
            "diferencia de otros titulos loe_clasica que necesitan una "
            "Orden de curriculo aparte -- no se ha necesitado ninguna "
            "fuente adicional de horas."
        ),
    }

    degree_id = insert_titulo(
        conn,
        code="TMV303",
        name="Mantenimiento aeromecánico de aviones con motor de pistón",
        level="SUPERIOR",
        hours=2540,
        family_id=23,
        region_id=None,
        articles=articles,
        cpps=cpps,
        cps=cps,
        ucs=ucs,
        og=og,
        modules=modules,
        hours_by_code=hours_by_code,
        fuente=fuente,
    )
    print("Insertado degree_id:", degree_id)
    conn.commit()
