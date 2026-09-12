# -*- coding: utf-8 -*-
"""Tecnico en Servicios funerarios (GM) -- RD 533/2025, de 24 de junio
(BOE-A-2025-14086). Generacion reforma_2024 (LOMLOE), mismo patron que SEA203
(sin Objetivos Generales -- articulo 9 es 'Espacios y equipamientos'; modulos
con doble duracion 50%/60%). Diferencia real con SEA203: el articulo 6 usa el
NUEVO catalogo de 'Estandares de Competencias Profesionales' (lista plana de
UC sin agrupar por Cualificacion Profesional -- sin codigo CP ni cita de RD),
no el catalogo clasico de Cualificaciones -- extract_cualificaciones() no
aplica (exige CP+referencia RD por entrada), se deja article_6_cps/ucs vacios
y el frontend ya cae al texto plano de article_6 en ese caso (confirmado en
catalogo/page.tsx, comentario explicito sobre este fallback)."""
import json
import re
import sqlite3
import sys

sys.path.insert(0, ".")
from scripts.build_titulo_nacional import fetch_boe, extract_articles_2_9, extract_lettered, insert_titulo

BOE_ID = "BOE-A-2025-14086"

soup = fetch_boe(BOE_ID)
articles = extract_articles_2_9(soup)
print("Articulos:", sorted(articles.keys()))
assert "9" not in articles or "bjetivo" not in articles.get(9, "").lower()
assert "bjetivo" not in "".join(articles.values()).lower(), "Se esperaba 0 menciones a Objetivos Generales (reforma_2024)"

cpps = extract_lettered(articles.get(5, ""))
og = []  # reforma_2024: no existe articulo/seccion de Objetivos Generales.
cps, ucs = [], []  # articulo 6 usa Estandares de Competencias (lista plana), no Cualificaciones -- ver docstring.
print("CPPS:", len(cpps))

all_tags = soup.find_all(["h5", "p"])
start = end = None
for i, t in enumerate(all_tags):
    if t.name == "h5" and "anexo_tit" in (t.get("class") or []) and t.get_text(strip=True).startswith("Módulos profesionales"):
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
    m_dur50 = re.match(r"^Duraci[oó]n\s+50\s*%\s*:\s*(\d+)\s*horas", txt)
    m_dur60 = re.match(r"^Duraci[oó]n\s+60\s*%\s*:\s*(\d+)\s*horas", txt)
    m_dur1 = re.match(r"^Duraci[oó]n\s*:\s*(\d+)\s*horas", txt)
    m_cod = re.match(r"^C[oó]digo[:.]\s*(\S+)", txt)
    m_ra = re.match(r"^(\d+)[.)]\s+(.+)$", txt)
    m_ce = re.match(r"^([a-zñ])\)\s*(.+)$", txt)
    if m_mod:
        if cur_mod:
            modules.append(cur_mod)
        cur_mod = {"name": m_mod.group(1).strip(), "code": None, "ras": [], "hours_50": None, "hours_60": None, "hours_single": None}
        cur_ra = None
    elif m_dur50 and cur_mod is not None:
        cur_mod["hours_50"] = int(m_dur50.group(1))
    elif m_dur60 and cur_mod is not None:
        cur_mod["hours_60"] = int(m_dur60.group(1))
    elif m_dur1 and cur_mod is not None:
        cur_mod["hours_single"] = int(m_dur1.group(1))
    elif m_cod and cur_mod is not None:
        cur_mod["code"] = m_cod.group(1).strip().rstrip(".")
    elif txt.startswith("Resultados de aprendizaje") or txt.startswith("Criterios de evaluaci"):
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
    hours = m["hours_60"] if m["hours_60"] is not None else m["hours_single"]
    hours_by_code[m["code"]] = {"hours": hours, "curso": None}
    print(m["code"], m["name"], "RA:", len(m["ras"]), "horas60/single:", hours, "horas50:", m["hours_50"])

total_ra = sum(len(m["ras"]) for m in modules)
total_ce = sum(len(ra["ces"]) for m in modules for ra in m["ras"])
total_hours_60 = sum(v["hours"] for v in hours_by_code.values())
total_hours_50 = sum(m["hours_50"] for m in modules if m["hours_50"] is not None)
print("TOTAL modulos:", len(modules), "RA:", total_ra, "CE:", total_ce)
print("Horas (col. 60%/unica):", total_hours_60, "-- Horas (col. 50%, solo modulos con doble cifra):", total_hours_50)

with sqlite3.connect("cdd_pro.db") as conn:
    dup = conn.execute("SELECT code, name FROM degrees WHERE name LIKE '%funerari%'").fetchall()
    print("Posibles duplicados:", dup)
    fam = conn.execute("SELECT id, code, name FROM professional_families WHERE name LIKE '%Sociocultural%'").fetchall()
    print("Familia SSC:", fam)
    assert not dup, "Ya existe un titulo con 'funerari' en el nombre"

    fuente = {
        "generacion": "reforma_2024",
        "rd_numero": "RD 533/2025",
        "rd_fecha": "2025-06-24",
        "boe_url": f"https://www.boe.es/buscar/act.php?id={BOE_ID}",
        "nota": (
            "Real Decreto 533/2025, de 24 de junio. Generacion reforma_2024 "
            "(LOMLOE): como en otros titulos de esta generacion, NO tiene "
            "articulo ni seccion de 'Objetivos Generales' -- confirmado "
            "buscando en todo el documento -- se sustituye por el sistema de "
            "Grados C/B/A (certificaciones parciales anidadas, Anexos V/VI/VII). "
            "El articulo 6 (relacion de competencias) usa aqui el NUEVO "
            "Catalogo Nacional de Estandares de Competencias Profesionales: "
            "es una lista plana de UC sin agrupar por Cualificacion "
            "Profesional (sin codigo CP ni cita de RD por grupo, a "
            "diferencia del Catalogo Nacional de Cualificaciones clasico) "
            "-- se ha dejado el texto plano del articulo 6 tal cual, sin "
            "forzarlo en la estructura CP/UC que no le corresponde. "
            "Los modulos traen 2 cifras de duracion ('50%'/'60%') sin "
            "definicion explicita en el texto del RD de que representa cada "
            "una -- usada la cifra 60% (mayor) como aproximacion de trabajo, "
            "igual que en el resto de titulos reforma_2024 de este catalogo, "
            "pendiente de confirmar con una Orden de implantacion cuando "
            "exista."
        ),
    }

    degree_id = insert_titulo(
        conn,
        code="SSC202",
        name="Servicios funerarios",
        level="MEDIO",
        hours=2000,
        family_id=21,
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
