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
    # Solo la seccion de "completa(s)" (antes de "incompletas", si existe).
    # La numeracion previa a "incompletas" varia: "2." simple (loe_clasica)
    # o "2.3.2." con puntos intermedios (FPB) -- \d+(?:\.\d+)*\. cubre ambas.
    seccion = re.split(r"\n\d+(?:\.\d+)*\.\s*Cualificaci[oó]n(?:es)? profesional(?:es)? incompletas?", articulo_6_text)[0]
    seccion = re.sub(r"^.*?Cualificaci[oó]n(?:es)? profesional(?:es)? completa[s]?:\s*\n?", "", seccion, count=1, flags=re.DOTALL)
    if not re.match(r"^[a-zñ]\)\s", seccion):
        seccion = "a) " + seccion
    entries = re.split(r"\n(?=[a-zñ]\)\s)", seccion)
    # 2 ordenes vistos: "a) {desc} {CODE} (ref), que comprende..." (la
    # mayoria de loe_clasica) y "a) {CODE}: {desc} (ref), que comprende..."
    # (FPB, p.ej. "a) HOT222_1: Operaciones basicas de pisos... (RD...)").
    # "que comprende/contiene/incluye las siguientes unidades de
    # competencia" al final a veces no aparece en absoluto -- las UC vienen
    # directamente despues del cierre del parentesis de la cita (visto en
    # RD 356/2014, Actividades Maritimo-Pesqueras) -- opcional.
    pat_desc_code = re.compile(
        r"^([a-zñ])\)\s*(.+?)\.?\s+([A-Z]{2,4}\s?\d{2,4}_\d)\.?\s*\(((?:R\.D\.|RD|Real Decreto|Decreto)[^)]+)\)\.?\s*(?:,?\s*que (?:comprende|contiene|incluye)[^\n]*)?",
        re.DOTALL,
    )
    pat_code_desc = re.compile(
        r"^([a-zñ])\)\s*([A-Z]{2,4}\s?\d{2,4}_\d)\s*:\s*(.+?)\s*\(((?:R\.D\.|RD|Real Decreto|Decreto)[^)]+)\)\.?\s*(?:,?\s*que (?:comprende|contiene|incluye)[^\n]*)?",
        re.DOTALL,
    )
    for entry in entries:
        m = pat_desc_code.match(entry)
        if m:
            letter, desc, code, ref = m.groups()
        else:
            m = pat_code_desc.match(entry)
            if not m:
                continue
            letter, code, desc, ref = m.groups()
        cps.append({"id": letter, "code": re.sub(r"\s+", "", code), "ref": ref, "desc": desc.strip()})
        for ucm in re.finditer(r"^(UC\d{4}_\d)[:.]?\s+(.+)$", entry, re.MULTILINE):
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
        if (
            tag.name in ("h5", "p")
            and re.match(r"^m[oó]dulos profesionales\.?$", tag.get_text(strip=True).lower())
            and start is None
        ):
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
        # "Modulo:" a secas es ambiguo: unas veces es el codigo numerico del
        # modulo ya abierto ("Modulo: 1027", RD 1144/2012), otras es la
        # cabecera de un modulo NUEVO con nombre en vez de codigo ("Modulo:
        # Instalaciones y equipos hiperbaricos.", RD 1073/2012) -- se
        # distingue por si lo que sigue son solo digitos o no.
        m_mod_short = None if m_mod else re.match(r"^M[oó]dulo:\s*(.+?)\.?$", txt)
        if m_mod_short and not re.match(r"^\d+$", m_mod_short.group(1).strip()):
            m_mod = m_mod_short
            m_mod_short = None
        m_cod = re.match(r"^C[oó]digo[:.]\s*(\S+)", txt) or m_mod_short
        m_ra = re.match(r"^(\d+)[.)]\s+(.+)$", txt)
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


def find_anexo_range(all_tags, titulo_name_substring: str):
    """Para un RD que agrupa varios titulos bajo un ANEXO cada uno (p.ej. RD
    127/2014, 14 FPB en un solo documento) -- localiza el rango [start, end)
    de tags del ANEXO cuyo h5.anexo_tit contiene `titulo_name_substring`
    (case-insensitive). El limite final es el siguiente h5.anexo_num (nuevo
    ANEXO) despues de start. `all_tags` debe venir de
    soup.find_all(["h5", "p"]) -- el mismo tag-set en todo el modulo, para
    que los indices sean consistentes entre llamadas."""
    start = None
    end = None
    for i, tag in enumerate(all_tags):
        if (
            tag.name == "h5"
            and tag.get("class") == ["anexo_tit"]
            and titulo_name_substring.lower() in tag.get_text(strip=True).lower()
            and start is None
        ):
            start = i
        elif start is not None and tag.name == "h5" and tag.get("class") == ["anexo_num"] and i > start:
            end = i
            break
    return start, end


def extract_fpb_sections(all_tags, start: int, end: int) -> dict:
    """Estructura de Formacion Profesional Basica (RD 127/2014 y hermanos):
    NO usa 'Articulo N.' -- usa secciones numeradas "1. Identificacion del
    titulo." / "2.1. Competencia general del titulo." / "2.2. Competencias
    del titulo." (CPPS, lista a-w) / "2.3. Relacion de cualificaciones..."
    (igual formato que el Articulo 6 de loe_clasica, reusa
    extract_cualificaciones) / "2.4. Entorno profesional." / "2.5.
    Prospectiva..." / "3.1. Objetivos generales del titulo" (lista a-y) /
    "3.2. Modulos profesionales." (solo tabla de contenidos, se ignora) /
    "3.3. Desarrollo de los modulos:" (contenido real, ver
    extract_modules_fpb). Se mapea 1:1 a los mismos campos boa_articles que
    loe_clasica (article_2/4/5/6/7/8/9) para que el resto de la app (vistas,
    RaOgMatrix, etc) no necesite tratamiento especial para titulos FPB."""
    markers = [
        (r"^1\.\s*Identificaci[oó]n del t[ií]tulo\.?$", "article_2"),
        (r"^2\.1\.?\s*Competencia general del t[ií]tulo\.?$", "article_4"),
        (r"^2\.2\.?\s*Competencias del t[ií]tulo\.?$", "article_5"),
        (r"^2\.3\.?\s*Relaci[oó]n de cualificaciones", "article_6"),
        (r"^2\.4\.?\s*Entorno profesional\.?$", "article_7"),
        (r"^2\.5\.?\s*Prospectiva del (?:t[ií]tulo|sector)", "article_8"),
        (r"^3\.1\.?\s*Objetivos generales del t[ií]tulo\.?$", "article_9"),
        (r"^3\.2\.?\s*M[oó]dulos profesionales\.?$", None),
        # El numero de sub-apartado antes de "Desarrollo de los modulos"
        # varia (3.3 normalmente, 3.4 cuando hay una seccion extra "3.3
        # Vinculacion con capacitaciones profesionales" antes) -- \d\.\d+
        # generico en vez de "3.3" fijo.
        (r"^3\.\d+\.?\s*Desarrollo de los m[oó]dulos[:.]?$", "__modules__"),
    ]
    sections: dict = {}
    current_key = None
    buf: list = []

    def flush():
        if current_key and current_key != "__modules__":
            sections[current_key] = "\n".join(buf).strip()
        buf.clear()

    modules_start = None
    for i in range(start, end):
        tag = all_tags[i]
        if tag.name != "p":
            continue
        txt = tag.get_text(strip=True)
        matched_key = None
        matched = False
        for pattern, key in markers:
            if re.match(pattern, txt, re.IGNORECASE):
                matched = True
                matched_key = key
                break
        if matched:
            flush()
            if matched_key == "__modules__":
                modules_start = i + 1
                current_key = None
                break
            current_key = matched_key
        elif current_key:
            buf.append(txt)
    flush()
    return sections, modules_start


def extract_modules_fpb(all_tags, modules_start: int, end: int) -> list:
    """Modulos de un titulo FPB (desde '3.3. Desarrollo de los modulos:'
    hasta `end`, el limite del ANEXO calculado por find_anexo_range()).
    Mismo patron interno que extract_modules_variant_c (Modulo Profesional:
    / Codigo: / RA numerados / Criterios de evaluacion: / CE letra) pero
    ADEMAS captura 'Duracion: N horas.' dentro de cada modulo -- las horas
    vienen embebidas en el propio RD, un FPB no tiene una Orden de
    curriculo separada con tabla de horas como loe_clasica."""
    modules = []
    cur_mod = None
    cur_ra = None
    for i in range(modules_start, end):
        tag = all_tags[i]
        if tag.name != "p":
            continue
        txt = tag.get_text(strip=True)
        m_mod = re.match(r"^M[oó]dulo [Pp]rofesional:\s*(.+?)\.?$", txt)
        # Mismo caso ambiguo que en extract_modules_variant_c: "Modulo:"
        # a secas puede ser el nombre de un modulo nuevo (si lo que sigue
        # no son solo digitos) -- visto en "Modulo: Ciencias aplicadas
        # II." dentro del mismo RD 127/2014.
        m_mod_short = None if m_mod else re.match(r"^M[oó]dulo:\s*(.+?)\.?$", txt)
        if m_mod_short and not re.match(r"^\d+$", m_mod_short.group(1).strip()):
            m_mod = m_mod_short
            m_mod_short = None
        m_cod = re.match(r"^C[oó]digo[:.]\s*(\S+)", txt) or m_mod_short
        m_dur = re.match(r"^Duraci[oó]n:\s*(\d+)\s*horas?\.?$", txt, re.IGNORECASE)
        m_ra = re.match(r"^(\d+)[.)]\s+(.+)$", txt)
        m_ce = re.match(r"^([a-zñ])\)\s*(.+)$", txt)
        if m_mod:
            if cur_mod:
                modules.append(cur_mod)
            cur_mod = {"name": m_mod.group(1).strip(), "code": None, "hours": None, "ras": []}
            cur_ra = None
        elif m_cod and cur_mod is not None:
            cur_mod["code"] = m_cod.group(1).strip().rstrip(".")
        elif m_dur and cur_mod is not None:
            cur_mod["hours"] = int(m_dur.group(1))
        elif txt.startswith("Resultados de aprendizaje") or txt.startswith("Criterios de evaluaci") or txt.startswith("Contenidos"):
            continue
        elif m_ra and cur_mod is not None and cur_mod.get("hours") is None:
            # Los "Contenidos basicos" que siguen a la Duracion tambien
            # pueden tener lineas que empiezan por numero -- una vez fijada
            # la duracion del modulo, dejar de interpretar "N. texto" como
            # RA nuevo (ya estamos en la seccion de contenidos, no en RA/CE).
            cur_ra = {"ra_number": int(m_ra.group(1)), "desc": m_ra.group(2).strip(), "ces": []}
            cur_mod["ras"].append(cur_ra)
        elif m_ce and cur_ra is not None and cur_mod.get("hours") is None:
            cur_ra["ces"].append({"letter": m_ce.group(1), "desc": m_ce.group(2).strip()})
    if cur_mod:
        modules.append(cur_mod)
    return modules


def extract_fpb_hours_from_orden(all_tags, start: int, end: int) -> dict:
    """Horas REALES por modulo de un titulo FPB, de la Orden de
    implantacion (p.ej. Orden ECD/1030/2014 para los 14 FPB de RD
    127/2014) -- las horas que trae el RD 127/2014 (Duracion: N horas.
    dentro de cada modulo) son solo el curriculo BASICO/minimo, no suman
    2000h; esta Orden reescribe cada modulo con las horas REALES de
    ambito Ministerio (mismo patron que loe_clasica: RD = minimas, Orden
    = curriculo completo). Devuelve {codigo: horas} -- sin curso, un FPB
    no reparte por curso en esta tabla."""
    result = {}
    cur_code = None
    for i in range(start, end):
        tag = all_tags[i]
        if tag.name != "p":
            continue
        txt = tag.get_text(strip=True)
        m_cod = re.match(r"^C[oó]digo[:.]\s*(\S+)", txt)
        m_dur = re.match(r"^Duraci[oó]n:\s*(\d+)\s*horas?\.?$", txt, re.IGNORECASE)
        if m_cod:
            cur_code = m_cod.group(1).strip().rstrip(".")
        elif m_dur and cur_code:
            result[cur_code] = int(m_dur.group(1))
            cur_code = None
    return result


def normalize_pdf_lines(raw_text: str, marker_res: list) -> list:
    """Los curriculos de Aragon (BOA) solo existen como PDF de varias
    docenas de paginas -- extraidos con PyMuPDF (fitz), NO WebFetch, el
    texto sale con saltos de linea de MAQUETACION (una frase real puede
    partirse en 2-3 lineas de PDF) en vez de saltos SEMANTICOS como en el
    HTML del BOE. Esta funcion une lineas de continuacion con la anterior
    y descarta cabeceras/pies de pagina repetidos ("csv: BOA...",
    fecha suelta, "Boletin Oficial de Aragon", "Num. NNN", numero de
    pagina suelto) que PyMuPDF inserta en mitad del contenido en cada
    salto de pagina. `marker_res` es una lista de regex (ya compilados)
    que, si SON el inicio de una linea, abren una entrada NUEVA -- el
    resto de lineas se van concatenando a la entrada abierta."""
    footer_res = [
        re.compile(r"^csv:\s*BOA\d+$"),
        re.compile(r"^\d{2}/\d{2}/\d{4}$"),
        re.compile(r"^Bolet[ií]n Oficial de Arag[oó]n$"),
        re.compile(r"^N[uú]m\.\s*\d+$"),
        re.compile(r"^\d{4,6}$"),
    ]
    lines = []
    pending_break = True
    for raw_line in raw_text.split("\n"):
        line = raw_line.strip()
        if not line:
            # Una linea en blanco separa parrafos/items en el PDF
            # original (p.ej. una lista de competencias sin letra a)/b)
            # propia, cada punto en su propio parrafo) -- se respeta como
            # limite aunque no haya marcador, para no fusionar dos items
            # distintos en una sola linea logica.
            pending_break = True
            continue
        if any(fr.match(line) for fr in footer_res):
            continue
        if lines and not pending_break and not any(mr.match(line) for mr in marker_res):
            lines[-1] = (lines[-1] + " " + line).strip()
        else:
            lines.append(line)
        pending_break = False
    return lines


def extract_modules_from_pdf_text(anexo_text: str) -> list:
    """Modulos de un Anexo I de un curriculo BOA (Aragon) en PDF, ya
    normalizado a lineas logicas con normalize_pdf_lines(). Mismo patron
    interno que extract_modules_variant_c/fpb (Modulo Profesional: /
    Codigo: / RA numerados / Criterios de evaluacion: / CE letra) mas
    'Duracion: N horas.' inline (igual que FPB, un curriculo BOA no
    necesita una Orden aparte para las horas -- ya trae su propia tabla,
    ver ANEXO VI, pero la duracion tambien viene repetida aqui por
    modulo)."""
    marker_res = [
        re.compile(r"^M[oó]dulo [Pp]rofesional:", re.IGNORECASE),
        re.compile(r"^C[oó]digo:", re.IGNORECASE),
        re.compile(r"^Duraci[oó]n:", re.IGNORECASE),
        re.compile(r"^Equivalencia en cr[eé]ditos", re.IGNORECASE),
        re.compile(r"^Resultados de aprendizaje", re.IGNORECASE),
        re.compile(r"^Criterios de evaluaci[oó]n:?$", re.IGNORECASE),
        re.compile(r"^\d+\.\s"),
        re.compile(r"^[a-zñ]\)\s"),
    ]
    lines = normalize_pdf_lines(anexo_text, marker_res)

    modules = []
    cur_mod = None
    cur_ra = None
    for txt in lines:
        m_mod = re.match(r"^M[oó]dulo [Pp]rofesional:\s*(.+?)\.?$", txt)
        m_cod = re.match(r"^C[oó]digo:\s*(\S+)", txt)
        m_dur = re.match(r"^Duraci[oó]n:\s*(\d+)\s*horas?\.?$", txt, re.IGNORECASE)
        m_ra = re.match(r"^(\d+)\.\s+(.+)$", txt)
        m_ce = re.match(r"^([a-zñ])\)\s*(.+)$", txt)
        if m_mod:
            if cur_mod:
                modules.append(cur_mod)
            cur_mod = {"name": m_mod.group(1).strip(), "code": None, "hours": None, "ras": []}
            cur_ra = None
        elif m_cod and cur_mod is not None:
            cur_mod["code"] = m_cod.group(1).strip().rstrip(".")
        elif m_dur and cur_mod is not None:
            cur_mod["hours"] = int(m_dur.group(1))
        elif txt.startswith("Resultados de aprendizaje") or txt.startswith("Criterios de evaluaci") or txt.startswith("Equivalencia en cr"):
            continue
        elif m_ra and cur_mod is not None:
            cur_ra = {"ra_number": int(m_ra.group(1)), "desc": m_ra.group(2).strip(), "ces": []}
            cur_mod["ras"].append(cur_ra)
        elif m_ce and cur_ra is not None:
            cur_ra["ces"].append({"letter": m_ce.group(1), "desc": m_ce.group(2).strip()})
    if cur_mod:
        modules.append(cur_mod)
    return modules


def extract_boa_hours_table(doc, page_range) -> dict:
    """Tabla de distribucion horaria (ANEXO VI de un curriculo BOA en
    PDF), via fitz page.find_tables() -- extraccion tabular real, no
    texto linearizado (las celdas de "Total horas" no coinciden de forma
    fiable con la duracion citada inline en el ANEXO I del mismo PDF: se
    ha visto al menos una discrepancia real entre ambas fuentes dentro
    del mismo documento -- esta tabla, cuya suma coincide exactamente con
    la duracion total del titulo citada en el Articulo 2, es la fuente de
    verdad). `doc` es un fitz.Document ya abierto; `page_range` un
    iterable de indices de pagina (0-based) donde buscar la tabla, p.ej.
    range(105, 115) -- inspeccionar el PDF a mano primero para acotarlo."""
    hours = {}
    for page_idx in page_range:
        if page_idx >= len(doc):
            continue
        page = doc[page_idx]
        for t in page.find_tables().tables:
            for row in t.extract():
                first = (row[0] or "").strip()
                m = re.match(r"^([A0-9]\d{2,3})\.\s", first)
                if not m or len(row) < 2:
                    continue
                total = (row[1] or "").strip()
                if total.isdigit():
                    hours[m.group(1)] = int(total)
    return hours


def extract_boa_sections(full_text: str) -> dict:
    """Cuerpo del articulado (antes de ANEXO I) de un curriculo BOA
    (Aragon) en PDF -- misma idea que extract_fpb_sections() pero
    localizando cada seccion por el TEXTO de su titulo, no por su numero
    de "Articulo N.": la numeracion real varia de un documento BOA a
    otro (aqui: 2 Identificacion, 3 Perfil, 4 Competencia general, 5
    Competencias -> CPPS, 6 Entorno, 7 Prospectiva, 8 Objetivos
    generales, 9 Modulos profesionales -- el RD base equivalente usa
    2/3/4/5/7/8/9, con el 6 siendo Cualificaciones/UC, que un curriculo
    BOA NO repite -- viene del RD base, ver fetch aparte). Devuelve
    boa_articles-shaped keys article_2/3/4/5/7/8 (article_9 aqui es en
    realidad "Objetivos generales" del titulo, no modulos)."""
    markers = [
        (r"^Art[íi]culo\s+\d+\.\s*Identificaci[oó]n del t[ií]tulo\.?", "article_2"),
        (r"^Art[íi]culo\s+\d+\.\s*Perfil profesional del t[ií]tulo\.?", "article_3"),
        (r"^Art[íi]culo\s+\d+\.\s*Competencia general\.?", "article_4"),
        (r"^Art[íi]culo\s+\d+\.\s*Competencias profesionales[^.]*\.", "article_5"),
        (r"^Art[íi]culo\s+\d+\.\s*Entorno profesional[^.]*\.", "article_7"),
        (r"^Art[íi]culo\s+\d+\.\s*Prospectiva del t[ií]tulo[^.]*\.", "article_8"),
        (r"^Art[íi]culo\s+\d+\.\s*Objetivos generales\.?", "article_9"),
        (r"^Art[íi]culo\s+\d+\.\s*M[oó]dulos profesionales\.?", None),
    ]
    # Los items de las listas de competencias/objetivos SI llevan letra
    # "a)\t..." en el PDF real (aunque no se vea al extraer solo el texto
    # visible de la pagina renderizada) -- se anaden como marcador propio
    # para que cada item quede en su propia linea logica, no fusionado
    # con la frase introductoria de la lista.
    marker_res = [re.compile(p) for p, _ in markers] + [re.compile(r"^[a-zñ]\)\s")]
    lines = normalize_pdf_lines(full_text, marker_res)

    sections: dict = {}
    current_key = None
    buf: list = []

    def flush():
        if current_key:
            sections[current_key] = "\n".join(buf).strip()
        buf.clear()

    for txt in lines:
        matched_key = "__unmatched__"
        rest = None
        for pattern, key in markers:
            m = re.match(pattern, txt)
            if m:
                matched_key = key
                rest = txt[m.end():].strip()
                break
        if matched_key != "__unmatched__":
            flush()
            if matched_key is None:
                current_key = None
                break
            current_key = matched_key
            # El marcador y el contenido que le sigue en el mismo titulo
            # ("Articulo 2. Identificacion del titulo. El titulo de...")
            # llegan fusionados en una sola linea logica tras
            # normalize_pdf_lines() -- el resto tras el propio marcador
            # es ya contenido real de la seccion, no se descarta.
            if rest:
                buf.append(rest)
        elif current_key:
            buf.append(txt)
    flush()
    return sections


def insert_titulo(conn, *, code, name, level, hours, family_id, region_id,
                   articles, cpps, cps, ucs, og, modules, hours_by_code,
                   fuente):
    """Inserta un titulo completo (degrees + modules + learning_outcomes +
    evaluation_criteria) en una unica transaccion. `modules` viene de
    extract_modules_variant_*(); `hours_by_code` de
    extract_hours_curso_from_orden_table() -- se cruzan por module['code'].
    No hace commit: llamar conn.commit() solo tras verificar el resultado."""
    import json

    # `articles` viene con claves numericas de extract_articles_2_9()
    # (loe_clasica/rd659_2023) o ya con claves "article_N" de
    # extract_fpb_sections()/extract_boa_sections() (FPB, BOA) -- se
    # normalizan las dos formas para no duplicar el prefijo
    # ("article_article_2", bug real que afecto a los 4 titulos FPB
    # insertados antes de esta correccion, ver Historico).
    boa_articles = {
        (k if isinstance(k, str) and k.startswith("article_") else f"article_{k}"): v
        for k, v in articles.items()
    }
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
