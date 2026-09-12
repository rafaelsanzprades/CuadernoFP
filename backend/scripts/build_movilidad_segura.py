# -*- coding: utf-8 -*-
"""Tecnico Superior en Formacion para la movilidad segura y sostenible --
RD 174/2021, de 23 de marzo (BOE-A-2021-4569). Estructura loe_clasica
ESTANDAR (a diferencia del grupo aeronautico: SI tiene articulo 6 de
Cualificaciones, sin desplazamiento de numeracion). La investigacion previa
de la sesion daba este titulo por bloqueado por no encontrar una Orden de
curriculo (ni Ministerio ni Aragon) -- igual que con el grupo aeronautico,
resulta que el propio RD ya trae las horas por modulo embebidas
('Duracion: N horas.' tras cada modulo), no hacia falta ninguna Orden."""
import re
import sqlite3
import sys

sys.path.insert(0, ".")
from scripts.build_titulo_nacional import fetch_boe, extract_articles_2_9, extract_lettered, extract_cualificaciones, insert_titulo

BOE_ID = "BOE-A-2021-4569"

soup = fetch_boe(BOE_ID)
articles = extract_articles_2_9(soup)
print("Articulos:", sorted(articles.keys()))

cpps = extract_lettered(articles.get(5, ""))
cps, ucs = extract_cualificaciones(articles.get(6, ""))
og = extract_lettered(articles.get(9, ""))
print("CPPS:", len(cpps), "CPs:", len(cps), "UCs:", len(ucs), "OG:", len(og))

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

hours_by_code = {m["code"]: {"hours": m["hours"], "curso": None} for m in modules}
for m in modules:
    print(m["code"], m["name"][:60], "RA:", len(m["ras"]), "horas:", m["hours"])

total_ra = sum(len(m["ras"]) for m in modules)
total_ce = sum(len(ra["ces"]) for m in modules for ra in m["ras"])
total_hours = sum(v["hours"] for v in hours_by_code.values() if v["hours"] is not None)
sin_horas = [m["code"] for m in modules if m["hours"] is None]
print("TOTAL modulos:", len(modules), "RA:", total_ra, "CE:", total_ce, "horas:", total_hours, "sin horas:", sin_horas)

with sqlite3.connect("cdd_pro.db") as conn:
    dup = conn.execute("SELECT code, name FROM degrees WHERE name LIKE '%ovilidad segura%'").fetchall()
    print("Posibles duplicados:", dup)
    assert not dup

    fuente = {
        "generacion": "rd659_2023",
        "rd_numero": "RD 174/2021",
        "rd_fecha": "2021-03-23",
        "boe_url": f"https://www.boe.es/buscar/act.php?id={BOE_ID}",
        "nota": (
            "Real Decreto 174/2021, de 23 de marzo. Las horas por modulo "
            "vienen embebidas en el propio texto del RD ('Duracion: N "
            "horas.' tras cada modulo) -- no se ha necesitado ninguna Orden "
            "de curriculo de Aragon ni del Ministerio, a diferencia de lo "
            "que se penso en una investigacion anterior de este mismo "
            "catalogo (que solo habia buscado una Orden separada)."
        ),
    }

    degree_id = insert_titulo(
        conn, code="SSC306", name="Formación para la movilidad segura y sostenible",
        level="SUPERIOR", hours=2000, family_id=21, region_id=None,
        articles=articles, cpps=cpps, cps=cps, ucs=ucs, og=og,
        modules=modules, hours_by_code=hours_by_code, fuente=fuente,
    )
    print("Insertado degree_id:", degree_id)
    conn.commit()
