# -*- coding: utf-8 -*-
"""
Pipeline reutilizable para construir un titulo nuevo del catalogo nacional
(item 4 del backlog) a partir del HTML real del BOE -- requests + BeautifulSoup,
NO WebFetch (resume/parafrasea texto legal, confirmado en sesiones anteriores).

Cubre la generacion `loe_clasica` (RD anterior a 659/2023). Para cada RD nuevo
hay que:
  1. fetch_boe(url_rd) y fetch_boe(url_orden_curriculo)
  2. Inspeccionar la estructura real del Anexo I (modulos) con BeautifulSoup --
     hay AL MENOS 3 variantes de maquetado vistas hasta ahora entre RDs de la
     misma decada (ver variant_a/b/c abajo). Elegir o escribir la funcion de
     extraccion de modulos correcta ANTES de dar nada por bueno.
  3. extract_articles_2_9() y extract_lettered()/extract_cualificaciones() son
     estables entre variantes (dependen solo de <h5 class="articulo">, valido
     en todos los RD "loe_clasica" vistos).
  4. Verificar recuentos (num RA, num CE, num modulos, horas totales=2000/2000)
     contra el HTML crudo ANTES de insertar en BD.
"""
import re
import requests
from bs4 import BeautifulSoup

HEADERS = {"User-Agent": "Mozilla/5.0"}


def fetch_boe(boe_id_or_url: str) -> BeautifulSoup:
    url = boe_id_or_url if boe_id_or_url.startswith("http") else f"https://www.boe.es/diario_boe/txt.php?id={boe_id_or_url}"
    r = requests.get(url, headers=HEADERS, timeout=30)
    r.raise_for_status()
    return BeautifulSoup(r.text, "html.parser")


def extract_articles_2_9(soup: BeautifulSoup) -> dict:
    articles = {}
    current_art = None
    buf = []

    def flush():
        nonlocal current_art, buf
        if current_art is not None:
            articles[current_art] = "\n".join(buf).strip()
        buf = []

    for el in soup.find_all(["h5", "p"]):
        cls = el.get("class", [])
        if el.name == "h5" and "articulo" in cls:
            txt = el.get_text(strip=True)
            m = re.match(r"Art[íi]culo\s+(\d+)\.", txt)
            flush()
            current_art = int(m.group(1)) if m and 2 <= int(m.group(1)) <= 9 else None
        elif el.name == "p" and current_art is not None:
            buf.append(el.get_text(strip=True))
    flush()
    return articles


def extract_lettered(text: str) -> list:
    return [
        {"id": m.group(1), "desc": m.group(2).strip()}
        for m in re.finditer(r"^([a-zñ])\)\s*(.+)$", text, re.MULTILINE)
    ]


def extract_cualificaciones(articulo_6_text: str):
    """El verbo antes de 'las siguientes unidades de competencia' varia
    entre RDs ('comprende'/'contiene'/'incluye') -- visto 'contiene' en RD
    1683/2011, 'comprende' en RD 454/2010/1797/2008. La cita del RD de la
    cualificacion tambien varia: '(R.D. .../...)' o '(Real Decreto
    .../..., de ...)' -- aceptar ambas formas. Cuando el titulo solo tiene
    UNA cualificacion completa, el RD usa singular ("Cualificacion
    profesional completa:") y NO antepone letra a) -- visto en RD
    189/2018 (Comercializacion de Productos Alimentarios). Se detecta
    ese caso y se sintetiza el id 'a' para no perder la cualificacion."""
    cps, ucs = [], []
    # Solo la seccion de "completa(s)" (antes de "incompletas", si existe)
    seccion = re.split(r"\n\d+\.\s*Cualificaci[oó]n(?:es)? profesional(?:es)? incompletas?", articulo_6_text)[0]
    seccion = re.sub(r"^.*?Cualificaci[oó]n(?:es)? profesional(?:es)? completa[s]?:\s*\n?", "", seccion, count=1, flags=re.DOTALL)
    if not re.match(r"^[a-zñ]\)\s", seccion):
        seccion = "a) " + seccion
    entries = re.split(r"\n(?=[a-zñ]\) )", seccion)
    for entry in entries:
        m = re.match(
            r"^([a-zñ])\)\s*(.+?)\.?\s+([A-Z]{2,4}\s?\d{2,4}_\d)\.?\s*\(((?:R\.D\.|RD|Real Decreto)[^)]+)\)\s*,?\s*que (?:comprende|contiene|incluye)",
            entry, re.DOTALL,
        )
        if not m:
            continue
        letter, desc, code, ref = m.groups()
        cps.append({"id": letter, "code": re.sub(r"\s+", "", code), "ref": ref, "desc": desc.strip()})
        for ucm in re.finditer(r"(UC\d{4}_\d)[:.]\s*(.+)", entry):
            ucs.append({"id": ucm.group(1), "cp_id": letter, "desc": ucm.group(2).strip()})
    return cps, ucs


def extract_modules_variant_c(soup: BeautifulSoup) -> list:
    """Variante 'limpia': ANEXO I (h5.anexo_tit conteniendo 'dulos
    Profesionales'), cada linea logica es su propio <p class="normal">.
    Modulo Profesional: {name} / Codigo: {code} / 'Resultados de
    aprendizaje y criterios de evaluacion.' (label, se ignora) / RA como
    '{n}. {texto}' / 'Criterios de evaluacion:' (label) / CE como
    '{letra})\\t{texto}'. Visto en RD 1683/2011 (Postimpresion y Acabados
    Graficos) -- confirmar que un RD nuevo usa este mismo patron antes de
    reusar (inspeccionar unas 10 lineas de su ANEXO I primero)."""
    all_tags = soup.find_all(["h5", "p"])
    start = None
    end = None
    for i, tag in enumerate(all_tags):
        if tag.name == "h5" and tag.get("class") == ["anexo_tit"] and "dulos profesionales" in tag.get_text().lower():
            start = i
        elif start is not None and tag.name == "h5" and "anexo_tit" in (tag.get("class") or []) and i > start:
            end = i
            break
    if start is None:
        raise ValueError("No se encontro 'Modulos Profesionales' (ANEXO I)")
    segment = all_tags[start + 1: end]

    modules = []
    cur_mod = None
    cur_ra = None
    for tag in segment:
        if tag.name != "p":
            continue
        txt = tag.get_text(strip=True)
        m_mod = re.match(r"^M[oó]dulo [Pp]rofesional:\s*(.+?)\.?$", txt)
        m_cod = re.match(r"^C[oó]digo[:.]\s*(\S+)", txt)
        m_ra = re.match(r"^(\d+)\.\s+(.+)$", txt)
        m_ce = re.match(r"^([a-zñ])\)\s*(.+)$", txt)
        if m_mod:
            if cur_mod:
                modules.append(cur_mod)
            cur_mod = {"name": m_mod.group(1).strip(), "code": None, "ras": []}
            cur_ra = None
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
    return modules


def extract_hours_curso_from_orden_table(soup: BeautifulSoup, table_index: int = 0) -> dict:
    """Tabla 'Modulo profesional | Duracion (horas) | Primer curso (h/semana)
    | Segundo curso 2 trimestres (h/semana) | Segundo curso 1 trimestre
    (horas)' de la Orden de curriculo completo. Devuelve
    {codigo: {"hours": int, "curso": "1º"/"2º"}}. FCT (fila con horas
    vacias en la columna Duracion y un valor solo en la ultima columna) se
    detecta y usa esa ultima columna como horas, curso '2º'."""
    tables = soup.find_all("table")
    table = tables[table_index]
    rows = table.find_all("tr")
    result = {}
    for r in rows:
        cells = [c.get_text(strip=True) for c in r.find_all(["td", "th"])]
        if not cells or not re.match(r"^\d{4}\.?\s", cells[0]):
            continue
        m_code = re.match(r"^(\d{4})\.?\s*(.+?)\.?$", cells[0])
        if not m_code:
            continue
        code = m_code.group(1)
        horas_cell = cells[1] if len(cells) > 1 else ""
        primer = cells[2] if len(cells) > 2 else ""
        segundo_2t = cells[3] if len(cells) > 3 else ""
        segundo_1t = cells[4] if len(cells) > 4 else ""
        if horas_cell.strip().isdigit():
            horas = int(horas_cell)
            curso = "1º" if primer.strip() else "2º"
        elif segundo_1t.strip().isdigit():
            horas = int(segundo_1t)
            curso = "2º"
        else:
            continue
        result[code] = {"hours": horas, "curso": curso}
    return result


def insert_titulo(conn, *, code, name, level, hours, family_id, region_id,
                   articles, cpps, cps, ucs, og, modules, hours_by_code,
                   fuente):
    """Inserta un titulo completo (degrees + modules + learning_outcomes +
    evaluation_criteria) en una unica transaccion. `modules` viene de
    extract_modules_variant_*(); `hours_by_code` de
    extract_hours_curso_from_orden_table() -- se cruzan por module['code'].
    No hace commit: llamar conn.commit() solo tras verificar el resultado."""
    import json

    boa_articles = {f"article_{n}": txt for n, txt in articles.items()}
    boa_articles["article_5_cpps"] = cpps
    boa_articles["article_6_cps"] = cps
    boa_articles["article_6_ucs"] = ucs
    boa_articles["article_9_og"] = og
    boa_articles["fuente"] = fuente

    c = conn.cursor()
    c.execute(
        "INSERT INTO degrees (family_id, level, name, hours, code, boa_articles, region_id) "
        "VALUES (?,?,?,?,?,?,?)",
        (family_id, level, f"{code} - {name}", hours, code, json.dumps(boa_articles, ensure_ascii=False), region_id),
    )
    degree_id = c.lastrowid

    for mod in modules:
        info = hours_by_code.get(mod["code"], {})
        mod_hours = info.get("hours")
        curso = info.get("curso")
        c.execute(
            "INSERT INTO modules (degree_id, code, name, hours, curso) VALUES (?,?,?,?,?)",
            (degree_id, mod["code"], mod["name"], mod_hours, curso),
        )
        module_id = c.lastrowid
        for ra in mod["ras"]:
            c.execute(
                "INSERT INTO learning_outcomes (module_id, ra_number, description) VALUES (?,?,?)",
                (module_id, ra["ra_number"], ra["desc"]),
            )
            lo_id = c.lastrowid
            for ce in ra["ces"]:
                ce_code = f"CE{ra['ra_number']}{ce['letter']}."
                c.execute(
                    "INSERT INTO evaluation_criteria (learning_outcome_id, ce_code, description) VALUES (?,?,?)",
                    (lo_id, ce_code, ce["desc"]),
                )
    return degree_id


if __name__ == "__main__":
    print("Modulo de referencia -- importar sus funciones desde un script por titulo.")
