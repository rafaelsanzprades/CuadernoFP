# -*- coding: utf-8 -*-
"""
Referencia de trabajo: extraccion fiel (sin resumir/parafrasear) de un titulo
de FP "loe_clasica" (anterior a RD 659/2023) directamente del HTML del BOE,
via requests + BeautifulSoup -- NO usar WebFetch para esto, resume y traduce
parcialmente el texto legal (confirmado en la sesion 2026-09-11/12).

Usado para construir los 2 primeros titulos nuevos del catalogo nacional
(item 5 del backlog, ver RF Ideas/01 Historico.md, entradas 2026-09-12):
VIC201 (Fabricacion de Productos Ceramicos, RD 454/2010) y VIC301
(Desarrollo y Fabricacion de Productos Ceramicos, RD 1797/2008).

NO es una herramienta generica lista para usar sin mirar -- cada RD del BOE
tiene variaciones de maquetado (ver las 2 variantes abajo, encontradas en
solo 2 documentos de la misma decada). Antes de reutilizar contra un RD
nuevo: descargar su HTML, inspeccionar la estructura real de su Anexo I con
BeautifulSoup (ver que clases usan los <h5>/<p> para modulo/codigo/RA/CE) y
adaptar el parser de modulos si hace falta -- la extraccion de Articulos 2-9
(articles_from_soup) si es estable entre documentos de esta generacion.

Bugs reales encontrados y corregidos, a tener en cuenta en cualquier reuso:
1. Los regex de listas letradas (CPPS, Objetivos Generales, criterios de
   evaluacion) deben incluir "ñ" en la clase de caracteres -- la
   numeracion oficial espanola va a,b,c...m,n,ñ,o,p... y un regex
   `[a-z]` sin mas se come esa entrada en silencio.
2. Un RA nuevo (patron "\\d+\\.") debe reconocerse SIEMPRE, sin importar el
   estado ("dentro de criterios de evaluacion" u otro) en el que este el
   parser -- un guard que lo bloquee hace que todos los RA siguientes de un
   modulo se fusionen como si fueran criterios del RA anterior.
3. Los modulos "loe_clasica" no siempre tienen los mismos limites claros
   que un titulo RD 659/2023 -- el modulo de FCT (Formacion en Centros de
   Trabajo) puede ir seguido, SIN cabecera de separacion, de un anexo de
   correspondencia RA<->UC que reutiliza la misma numeracion 1/2/3... Hay
   que verificar a mano el RA final de cada modulo contra el HTML crudo
   antes de dar por buena la extraccion (aqui se resolvio recortando a los
   RA reales conocidos, no hay deteccion automatica de ese limite todavia).
4. Las horas por modulo casi nunca estan en el RD (que solo fija "enseñanzas
   minimas") -- estan en la Orden de curriculo completo asociada (buscar
   "Orden ministerio/curriculo Grado X titulo BOE"), en una <table> con
   columnas Modulo/Duracion. El total de esa tabla puede no sumar las 2000h
   completas si el titulo reserva horas para impartir un modulo en ingles
   sin un codigo de modulo propio -- no es un error de extraccion.
"""
import re
from bs4 import BeautifulSoup


def extract_articles_2_9(soup: BeautifulSoup) -> dict[int, str]:
    """Estable entre las 2 variantes vistas hasta ahora: cada <h5
    class="articulo"> abre un articulo, y los <p> siguientes (cualquier
    clase) son su cuerpo hasta el proximo <h5 class="articulo">."""
    articles: dict[int, str] = {}
    current_art = None
    buf: list[str] = []

    def flush():
        nonlocal current_art, buf
        if current_art is not None:
            articles[current_art] = "\n".join(buf).strip()
        buf = []

    for el in soup.find_all(["h5", "p"]):
        cls = el.get("class", [])
        if el.name == "h5" and "articulo" in cls:
            txt = el.get_text(strip=True)
            m = re.match(r"Art[íi]culo (\d+)\.", txt)
            flush()
            current_art = int(m.group(1)) if m and 2 <= int(m.group(1)) <= 9 else None
        elif el.name == "p" and current_art is not None:
            buf.append(el.get_text(strip=True))
    flush()
    return articles


def extract_lettered(text: str) -> list[dict]:
    """CPPS (Art. 5) u Objetivos Generales (Art. 9): listas "a) ... b) ...".
    Incluye ñ a proposito, ver bug 1 en el docstring del modulo."""
    return [
        {"id": m.group(1), "desc": m.group(2).strip()}
        for m in re.finditer(r"^([a-zñ])\)\s*(.+)$", text, re.MULTILINE)
    ]


def extract_cualificaciones(articulo_6_text: str) -> tuple[list[dict], list[dict]]:
    """CP (Cualificaciones) + UC (Unidades de Competencia) del Articulo 6,
    formato "a) {desc} {CODIGO} (R.D. .../..., de ... de ...) que comprende
    las siguientes unidades de competencia:\\nUC####_#: {desc}\\n..."."""
    cps, ucs = [], []
    entries = re.split(r"\n(?=[a-zñ]\) )", articulo_6_text)
    for entry in entries:
        m = re.match(
            r"^([a-zñ])\)\s*(.+?)\s+([A-Z]{2,4}\d{2,3}_\d)\s*\((R\.D\.[^)]+)\)\s*que comprende",
            entry, re.DOTALL,
        )
        if not m:
            continue
        letter, desc, code, ref = m.groups()
        cps.append({"id": letter, "code": code, "ref": ref, "desc": desc.strip()})
        for ucm in re.finditer(r"(UC\d{4}_\d):\s*(.+)", entry):
            ucs.append({"id": ucm.group(1), "cp_id": letter, "desc": ucm.group(2).strip()})
    return cps, ucs


# ---------------------------------------------------------------------------
# Variante A (vista en RD 454/2010): cada linea logica es su propio <p>,
# con clases dedicadas para cabecera de modulo (`centro_negrita`), RA
# (`texto independiente 3`) y CE (`normal`). Ver commit del titulo VIC201
# para el parser de modulos completo usado con esta variante.
#
# Variante B (vista en RD 1797/2008, mas antigua): un mismo <p> puede
# mezclar el numero de RA, "Criterios de evaluacion:" y el primer criterio
# letrado; los <h5> reutilizan clases genericas (`capitulo_tit`/`seccion`/
# `subseccion`) para cabecera de modulo/codigo/titulo de seccion. Hace falta
# un parser linea a linea (dividir el texto de cada <p>/<h5> por "\n" antes
# de clasificar cada linea) en vez de asumir un elemento = una linea. Ver
# commit del titulo VIC301 para el parser completo usado con esta variante.
# ---------------------------------------------------------------------------
