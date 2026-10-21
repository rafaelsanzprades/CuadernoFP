"""
Unifica la tipografía de las tres plantillas de programación didáctica en Arial (2026-10-21, a petición de Rafael):

  - modelo_pd_fp-.docx            (PD-)   Courier -> Arial
  - modelo_pd_fp=.docx            (PD=)   Times New Roman (cabecera) -> Arial; quita las dos fuentes incrustadas (Calibri y Cambria, 3 MB)
  - modelo_pd_jeg_tpl_final.docx  (PD+)   Aptos -> Arial (Aptos solo existe en Microsoft 365)

Se cambian los nombres de fuente de texto (rFonts de document, estilos, numeración, cabeceras y pies, y las fuentes latinas del tema).
Se dejan Symbol y Wingdings (son de viñetas, no de texto), las fuentes de otras escrituras del tema y la fuente matemática (Cambria Math).

Es idempotente. Uso:   cd backend && python scripts/unificar_fuente_arial.py
"""

import os
import re
import zipfile

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLANTILLAS = ["modelo_pd_fp-.docx", "modelo_pd_fp=.docx", "modelo_pd_jeg_tpl_final.docx"]
ORIGEN = {"Aptos", "Aptos Display", "Aptos Narrow", "Calibri", "Cambria", "Courier", "Courier New", "Times New Roman"}


def cambiar_rfonts(xml):
    def sub(m):
        return m.group(0) if m.group(2) not in ORIGEN else f'{m.group(1)}"Arial"'
    return re.sub(r'(w:(?:ascii|hAnsi|cs|eastAsia)=)"([^"]+)"', sub, xml)


def cambiar_tema(xml):
    # solo las fuentes latinas de títulos y de cuerpo; las de otras escrituras (<a:font script=...>) no se tocan
    return re.sub(r'(<a:latin typeface=)"([^"]+)"', lambda m: f'{m.group(1)}"Arial"' if m.group(2) in ORIGEN else m.group(0), xml)


def quitar_incrustadas(zin, partes):
    """Quita word/fonts/*, sus relaciones, las etiquetas embed* de la tabla de fuentes y los ajustes de incrustación."""
    nombres = zin.namelist()
    fuentes = [n for n in nombres if n.startswith("word/fonts/")]
    if not fuentes:
        return partes, False
    for n in fuentes:
        partes.pop(n, None)
    ft = partes["word/fontTable.xml"].decode("utf-8")
    ft = re.sub(r"<w:embed(?:Regular|Bold|Italic|BoldItalic)\b[^>]*/>", "", ft)
    partes["word/fontTable.xml"] = ft.encode("utf-8")
    partes.pop("word/_rels/fontTable.xml.rels", None)
    ct = partes["[Content_Types].xml"].decode("utf-8")
    ct = re.sub(r'<Default Extension="odttf"[^>]*/>', "", ct)
    partes["[Content_Types].xml"] = ct.encode("utf-8")
    st = partes["word/settings.xml"].decode("utf-8")
    st = re.sub(r"<w:(?:embedTrueTypeFonts|saveSubsetFonts)\b[^>]*/>", "", st)
    partes["word/settings.xml"] = st.encode("utf-8")
    return partes, True


def procesar(nombre):
    ruta = os.path.join(BASE, "templates", nombre)
    zin = zipfile.ZipFile(ruta)
    orden = [i.filename for i in zin.infolist()]
    partes = {n: zin.read(n) for n in orden}
    cambios = []
    for n in list(partes):
        if not (n.startswith("word/") and n.endswith(".xml")) or n == "word/fontTable.xml":
            continue
        x = partes[n].decode("utf-8")
        y = cambiar_tema(x) if n.startswith("word/theme/") else cambiar_rfonts(x)
        if y != x:
            partes[n] = y.encode("utf-8")
            cambios.append(n)
    partes, quitadas = quitar_incrustadas(zin, partes)
    zin.close()
    if not cambios and not quitadas:
        print(f"{nombre}: sin cambios (ya estaba en Arial)")
        return
    tmp = ruta + ".tmp"
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        for n in orden:
            if n in partes:
                zout.writestr(n, partes[n])
    os.replace(tmp, ruta)
    print(f"{nombre}: {len(cambios)} partes con fuente cambiada" + (", fuentes incrustadas quitadas" if quitadas else "") + f" -> {os.path.getsize(ruta) // 1024} KB")


if __name__ == "__main__":
    for p in PLANTILLAS:
        procesar(p)
