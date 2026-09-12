# -*- coding: utf-8 -*-
"""Corrige TMV302 (Mantenimiento aeromecanico de Aviones con Motor de
Turbina): su registro preexistente (de antes de este pipeline, sin
fuente.nota) tenia el `degrees.name`/`code` correctos pero el contenido real
de `boa_articles` (article_2..9, cpps, og) era consistentemente sobre
HELICOPTEROS con motor de turbina (confirmado leyendo el texto completo:
"Denominacion: ... Helicopteros...", articulo_4, articulo_5 (competencias),
articulo_9_og y la lista de modulos del propio articulo_9 -- todos dicen
helicopteros, no es un typo aislado). No es un simple find&replace de
palabra: es contenido de OTRO titulo (RD 1447/2018, el mismo que ya se
construyo limpio como TMV305 en esta sesion) pegado por error bajo el
registro de TMV302. Se reconstruye TMV302 de cero desde su fuente real, RD
1445/2018 (BOE-A-2019-545, Aviones con Motor de Turbina), con el mismo
pipeline ya usado para TMV303/304/305 -- UPDATE de boa_articles + DELETE/
re-INSERT de modules/RA/CE, mismo degree_id, mismo code/name (ya eran
correctos)."""
import re
import sqlite3
import sys

sys.path.insert(0, ".")
from scripts.build_titulo_nacional import fetch_boe, extract_articles_2_9, extract_lettered

BOE_ID = "BOE-A-2019-545"

soup = fetch_boe(BOE_ID)
raw_articles = extract_articles_2_9(soup)
print("Articulos crudos:", sorted(raw_articles.keys()))
articles = {
    2: raw_articles[2], 3: raw_articles[3], 4: raw_articles[4], 5: raw_articles[5],
    7: raw_articles[6], 8: raw_articles[7], 9: raw_articles[8],
}
assert "helic" not in articles[2].lower(), "El RD 1445/2018 no deberia mencionar helicopteros"
assert "avion" in articles[2].lower() or "avión" in articles[2].lower()

cpps = extract_lettered(articles[5])
og = extract_lettered(articles[9])
cps, ucs = [], []
print("CPPS:", len(cpps), "OG:", len(og))
print("ART2:", articles[2][:200])

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

for m in modules:
    print(m["code"], m["name"][:65], "RA:", len(m["ras"]), "horas:", m["hours"])
total_ra = sum(len(m["ras"]) for m in modules)
total_ce = sum(len(ra["ces"]) for m in modules for ra in m["ras"])
total_hours = sum(m["hours"] for m in modules if m["hours"] is not None)
sin_horas = [m["code"] for m in modules if m["hours"] is None]
print("TOTAL modulos:", len(modules), "RA:", total_ra, "CE:", total_ce, "horas:", total_hours, "sin horas:", sin_horas)

import json

with sqlite3.connect("cdd_pro.db") as conn:
    degree_id = conn.execute("SELECT id FROM degrees WHERE code='TMV302'").fetchone()[0]
    print("degree_id TMV302:", degree_id)

    boa_articles = {f"article_{k}": v for k, v in articles.items()}
    boa_articles["article_5_cpps"] = cpps
    boa_articles["article_6_cps"] = cps
    boa_articles["article_6_ucs"] = ucs
    boa_articles["article_9_og"] = og
    boa_articles["fuente"] = {
        "generacion": "rd659_2023",
        "rd_numero": "RD 1445/2018",
        "rd_fecha": "2018-12-14",
        "boe_url": f"https://www.boe.es/buscar/act.php?id={BOE_ID}",
        "nota": (
            "Real Decreto 1445/2018, de 14 de diciembre. Reconstruido el "
            "2026-09-12: el registro preexistente tenia el nombre/codigo "
            "correctos (Aviones con Motor de Turbina) pero su boa_articles "
            "completo (identificacion, competencias, objetivos generales, "
            "lista de modulos) era en realidad el contenido de Helicopteros "
            "con Motor de Turbina (RD 1447/2018) -- no un error de una "
            "palabra suelta, el documento entero no correspondia al "
            "titulo. Titulo EASA/AESA: no tiene articulo de Cualificaciones "
            "(numeracion de articulos remapeada, igual que TMV303/304/305 -- "
            "no existe article_6). Horas por modulo embebidas en el propio "
            "texto del RD."
        ),
    }
    conn.execute("UPDATE degrees SET hours=?, boa_articles=? WHERE id=?", (2540, json.dumps(boa_articles, ensure_ascii=False), degree_id))

    old_mod_ids = [r[0] for r in conn.execute("SELECT id FROM modules WHERE degree_id=?", (degree_id,)).fetchall()]
    print("Modulos antiguos a borrar:", len(old_mod_ids))
    for mid in old_mod_ids:
        conn.execute("DELETE FROM evaluation_criteria WHERE learning_outcome_id IN (SELECT id FROM learning_outcomes WHERE module_id=?)", (mid,))
        conn.execute("DELETE FROM learning_outcomes WHERE module_id=?", (mid,))
    conn.execute("DELETE FROM modules WHERE degree_id=?", (degree_id,))

    for mod in modules:
        conn.execute(
            "INSERT INTO modules (degree_id, code, name, hours, curso) VALUES (?,?,?,?,?)",
            (degree_id, mod["code"], mod["name"], mod["hours"], None),
        )
        module_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        for ra in mod["ras"]:
            conn.execute(
                "INSERT INTO learning_outcomes (module_id, ra_number, description) VALUES (?,?,?)",
                (module_id, ra["ra_number"], ra["desc"]),
            )
            lo_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
            for ce in ra["ces"]:
                ce_code = f"CE{ra['ra_number']}{ce['letter']}."
                conn.execute(
                    "INSERT INTO evaluation_criteria (learning_outcome_id, ce_code, description) VALUES (?,?,?)",
                    (lo_id, ce_code, ce["desc"]),
                )
    conn.commit()
    print("COMMIT OK -- TMV302 reconstruido")
