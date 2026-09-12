# -*- coding: utf-8 -*-
"""Tecnico Superior en Mantenimiento aeromecanico de helicopteros -- 2
titulos hermanos de la misma tanda que aviones con motor de piston
(TMV303, RD 1444/2018): RD 1446/2018 (piston, BOE-A-2019-546) y RD
1447/2018 (turbina, BOE-A-2019-547). Misma estructura EASA/AESA exacta:
sin articulo de Cualificaciones (numeracion desplazada, ver
build_aviones_piston.py), horas embebidas en el propio texto del RD."""
import re
import sqlite3
import sys

sys.path.insert(0, ".")
from scripts.build_titulo_nacional import fetch_boe, extract_articles_2_9, extract_lettered, insert_titulo

TITULOS = [
    {
        "boe_id": "BOE-A-2019-546",
        "code": "TMV304",
        "name": "Mantenimiento aeromecánico de helicópteros con motor de pistón",
        "dup_check": "%elic%pter%pist%",
    },
    {
        "boe_id": "BOE-A-2019-547",
        "code": "TMV305",
        "name": "Mantenimiento aeromecánico de helicópteros con motor de turbina",
        "dup_check": "%elic%pter%turbina%",
    },
]


def extract_modules(soup):
    """RD 1446/2018 (helicopteros piston) tiene una variante de maquetado no
    vista en los otros titulos de este grupo: los Criterios de evaluacion
    NO llevan letra 'a)'/'b)' -- son frases sueltas, una por <p>, entre
    'Criterios de evaluacion:' y el siguiente RA numerado (o el fin del
    modulo). RD 1444/2018 y RD 1447/2018 SI usan letra. Se soporta ambos
    formatos con un estado `ce_mode`: mientras esta activo, una linea con
    letra usa su propia letra y una linea sin letra recibe letra
    autoincrementada -- asi funciona igual de bien con cualquiera de los 2
    formatos sin necesidad de un extractor distinto por RD."""
    all_tags = soup.find_all(["h5", "p"])
    start = end = None
    for i, t in enumerate(all_tags):
        if t.name == "h5" and "anexo_tit" in (t.get("class") or []) and re.match(r"^m[oó]dulos profesionales\.?$", t.get_text(strip=True).lower()) and start is None:
            start = i
        elif start is not None and t.name == "h5" and "anexo_num" in (t.get("class") or []) and i > start:
            end = i
            break
    assert start is not None and end is not None, "No se encontro ANEXO I"

    modules = []
    cur_mod = None
    cur_ra = None
    ce_mode = False
    auto_letter_idx = 0
    letters = "abcdefghijklmnopqrstuvwxyzñ"
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
            ce_mode = False
        elif m_dur and cur_mod is not None:
            cur_mod["hours"] = int(m_dur.group(1))
            ce_mode = False
        elif m_cod and cur_mod is not None:
            cur_mod["code"] = m_cod.group(1).strip().rstrip(".")
        elif txt.startswith("Resultados de aprendizaje") or txt.startswith("Equivalencia en cr"):
            continue
        elif txt.startswith("Criterios de evaluaci"):
            ce_mode = True
            auto_letter_idx = 0
            continue
        elif txt.startswith("Contenidos b") or txt.startswith("Orientaciones pedag"):
            ce_mode = False
        elif m_ra and cur_mod is not None:
            cur_ra = {"ra_number": int(m_ra.group(1)), "desc": m_ra.group(2).strip(), "ces": []}
            cur_mod["ras"].append(cur_ra)
            ce_mode = False
        elif m_ce and cur_ra is not None and ce_mode:
            cur_ra["ces"].append({"letter": m_ce.group(1), "desc": m_ce.group(2).strip()})
        elif ce_mode and cur_ra is not None and txt:
            cur_ra["ces"].append({"letter": letters[auto_letter_idx % len(letters)], "desc": txt})
            auto_letter_idx += 1
    if cur_mod:
        modules.append(cur_mod)
    return modules


with sqlite3.connect("cdd_pro.db") as conn:
    for spec in TITULOS:
        print("=" * 20, spec["code"], spec["boe_id"])
        dup = conn.execute("SELECT code, name FROM degrees WHERE name LIKE ?", (spec["dup_check"],)).fetchall()
        print("Posibles duplicados:", dup)
        assert not dup, f"Ya existe un titulo para {spec['code']}"

        soup = fetch_boe(spec["boe_id"])
        raw_articles = extract_articles_2_9(soup)
        print("Articulos crudos:", sorted(raw_articles.keys()))
        articles = {
            2: raw_articles[2], 3: raw_articles[3], 4: raw_articles[4], 5: raw_articles[5],
            7: raw_articles[6], 8: raw_articles[7], 9: raw_articles[8],
        }
        cpps = extract_lettered(articles[5])
        og = extract_lettered(articles[9])
        cps, ucs = [], []

        modules = extract_modules(soup)
        hours_by_code = {m["code"]: {"hours": m["hours"], "curso": None} for m in modules}
        for m in modules:
            print(" ", m["code"], m["name"][:65], "RA:", len(m["ras"]), "horas:", m["hours"])

        total_ra = sum(len(m["ras"]) for m in modules)
        total_ce = sum(len(ra["ces"]) for m in modules for ra in m["ras"])
        total_hours = sum(v["hours"] for v in hours_by_code.values() if v["hours"] is not None)
        sin_horas = [m["code"] for m in modules if m["hours"] is None]
        print("TOTAL modulos:", len(modules), "RA:", total_ra, "CE:", total_ce, "horas:", total_hours, "sin horas:", sin_horas)

        # Duracion declarada en el articulo 2 (para contraste con la suma real).
        m_dur_total = re.search(r"Duraci[oó]n:\s*(\d[\d.]*)\s*horas", articles[2])
        rd_hours = int(m_dur_total.group(1).replace(".", "")) if m_dur_total else None
        print("Horas declaradas en Art.2:", rd_hours)

        rd_num = "RD 1446/2018" if spec["boe_id"].endswith("546") else "RD 1447/2018"
        fuente = {
            "generacion": "rd659_2023",
            "rd_numero": rd_num,
            "rd_fecha": "2018-12-14",
            "boe_url": f"https://www.boe.es/buscar/act.php?id={spec['boe_id']}",
            "nota": (
                f"{rd_num}, de 14 de diciembre ({spec['boe_id']}). Titulo EASA/AESA "
                "de mantenimiento aeronautico: no tiene articulo de Cualificaciones y "
                "Unidades de Competencia del Catalogo Nacional (no referencia el "
                "catalogo INCUAL, igual que el resto de titulos de este grupo) -- la "
                "numeracion de articulos del RD se desplaza una posicion respecto al "
                "patron estandar; remapeado al guardar (Art.6 real = Entorno -> "
                "article_7, Art.7 real = Prospectiva -> article_8, Art.8 real = "
                "Objetivos generales -> article_9; no existe article_6). Las horas "
                "por modulo vienen embebidas en el propio texto del RD ('Duracion: N "
                "horas.' tras cada modulo), no ha hecho falta ninguna Orden de "
                "curriculo aparte."
            ),
        }

        degree_id = insert_titulo(
            conn, code=spec["code"], name=spec["name"], level="SUPERIOR",
            hours=rd_hours, family_id=23, region_id=None,
            articles=articles, cpps=cpps, cps=cps, ucs=ucs, og=og,
            modules=modules, hours_by_code=hours_by_code, fuente=fuente,
        )
        print("Insertado degree_id:", degree_id)
    conn.commit()
    print("COMMIT OK")
