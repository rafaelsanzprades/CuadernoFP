"""
Seed script: Scrapea datos ECP del INCUAL para todas las familias profesionales.
Uso: cd backend && .venv313\Scripts\python.exe seed_incual.py
"""
import sys
import re
import json
import time
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timezone

sys.stdout.reconfigure(encoding='utf-8')

from database import SessionLocal
from models import ProfessionalFamily, IncualFamilyData

# Mapeo: código BD -> slug INCUAL
FAMILY_SLUGS = {
    "IFC": "informatica-y-comunicaciones",
    "SAN": "sanidad",
    "COM": "comercio-y-marketing",
    "HOT": "hosteleria-y-turismo",
    "ELE": "electricidad-y-electronica",
    "ADG": "administracion-y-gestion",
    "AFD": "actividades-fisicas-y-deportivas",
    "AGA": "agraria",
    "ARG": "artes-graficas",
    "EOC": "edificacion-y-obra-civil",
    "ENA": "energia-y-agua",
    "FME": "fabricacion-mecanica",
    "IMP": "imagen-personal",
    "IMS": "imagen-y-sonido",
    "INA": "industrias-alimentarias",
    "IEX": "industrias-extractivas",
    "IMA": "instalacion-y-mantenimiento",
    "MAM": "madera-mueble-y-corcho",
    "QUI": "quimica",
    "SEA": "seguridad-y-medio-ambiente",
    "SSC": "servicios-socioculturales-y-a-la-comunidad",
    "TCP": "textil-confeccion-y-piel",
    "TMV": "transporte-y-mantenimiento-de-vehiculos",
    # Nuevas familias INCUAL (sin código BD propio)
    "AAT": "actividades-y-competencias-transversales",
    "IAD": "inteligencia-artificial-y-data",
    "MAP": "maritimo-pesquera",
    "VIC": "vidrio-y-ceramica",
}

# Slugs cortos para URLs de INCUAL (diferentes de los slugs de familia)
INCUAL_URL_SLUGS = {
    "informatica-y-comunicaciones": "informatica",
    "sanidad": "sanidad",
    "comercio-y-marketing": "comercio",
    "hosteleria-y-turismo": "hosteleria",
    "electricidad-y-electronica": "electricidad",
    "administracion-y-gestion": "administracion",
    "actividades-fisicas-y-deportivas": "deportivas",
    "agraria": "agraria",
    "artes-graficas": "artes",
    "edificacion-y-obra-civil": "edificacion",
    "energia-y-agua": "energia",
    "fabricacion-mecanica": "mecanica",
    "imagen-personal": "imagen",
    "imagen-y-sonido": "sonido",
    "industrias-alimentarias": "alimentarias",
    "industrias-extractivas": "extractivas",
    "instalacion-y-mantenimiento": "mantenimiento",
    "madera-mueble-y-corcho": "madera",
    "quimica": "quimica",
    "seguridad-y-medio-ambiente": "seguridad",
    "servicios-socioculturales-y-a-la-comunidad": "servicios",
    "textil-confeccion-y-piel": "textil",
    "transporte-y-mantenimiento-de-vehiculos": "transporte",
    "actividades-y-competencias-transversales": "actividades-transversales",
    "inteligencia-artificial-y-data": "inteligencia-artificial",
    "maritimo-pesquera": "maritimo-pesquera",
    "vidrio-y-ceramica": "vidrio-y-ceramica",
}

BASE_URL = "https://incual.educacion.gob.es"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept-Language": "es-ES,es;q=0.9",
}

def get_soup(url):
    """Fetch URL y devuelve BeautifulSoup"""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        return BeautifulSoup(resp.text, 'html.parser')
    except Exception as e:
        print(f"  ERROR fetching {url}: {e}")
        return None

def parse_ecp_items(soup, nivel):
    """Extrae items ECP de una página de nivel"""
    items = []
    if not soup:
        return items
    
    # Buscar todos los bloques ECP
    text = soup.get_text()
    # Patrón: ECPxxxx_N - Título ... descripción
    pattern = rf'(ECP\d+_{nivel})\s*-\s*(.+?)(?=Leer más|ECP\d+_|$)'
    
    # Método alternativo: buscar por estructura HTML
    # Los ECP están en divs con el código como heading
    for heading in soup.find_all(['h3', 'h4', 'strong', 'b']):
        txt = heading.get_text(strip=True)
        match = re.match(rf'(ECP\d+_{nivel})\s*-\s*(.+)', txt)
        if match:
            code = match.group(1)
            title = match.group(2).strip()
            
            # Buscar descripción (texto siguiente)
            desc = ""
            parent = heading.parent
            if parent:
                siblings_text = parent.get_text(strip=True)
                # Extraer descripción después del título
                desc_match = re.search(rf'{re.escape(code)}\s*-\s*.+?Leer más.*?\.\.\.(.*)', siblings_text, re.DOTALL)
                if desc_match:
                    desc = desc_match.group(1).strip()[:500]
            
            # Buscar PDF URL
            pdf_url = ""
            link = heading.find_next('a', href=True)
            if link and 'documents' in link.get('href', ''):
                pdf_url = link['href']
                if not pdf_url.startswith('http'):
                    pdf_url = BASE_URL + pdf_url
            
            items.append({
                "code": code,
                "title": title,
                "description": desc,
                "pdf_url": pdf_url
            })
    
    # Si no encontramos por headings, intentar por regex en texto plano
    if not items:
        for match in re.finditer(rf'(ECP\d+_{nivel})\s*-\s*(.+?)(?:Leer más|\n)', text):
            code = match.group(1)
            title = match.group(2).strip()
            items.append({
                "code": code,
                "title": title,
                "description": "",
                "pdf_url": ""
            })
    
    return items

def parse_crn(soup):
    """Extrae Centros de Referencia Nacional"""
    centers = []
    if not soup:
        return centers
    
    # Buscar sección CRN
    text = soup.get_text()
    
    # Buscar headings de centros
    for heading in soup.find_all(['h3', 'h4']):
        txt = heading.get_text(strip=True)
        if 'Centro' in txt or 'centro' in txt:
            center = {"name": txt, "url": "", "areas": "", "titular": "", "ccaa": ""}
            
            # Buscar enlace
            link = heading.find('a', href=True)
            if link:
                center["url"] = link.get('href', '')
            
            # Buscar info en texto siguiente
            parent = heading.parent
            if parent:
                info_text = parent.get_text()
                area_match = re.search(r'[Áá]reas?\s+profesional(?:es)?:\s*(.+?)\.', info_text)
                if area_match:
                    center["areas"] = area_match.group(1).strip()
                titular_match = re.search(r'Titular:\s*(.+?)\.', info_text)
                if titular_match:
                    center["titular"] = titular_match.group(1).strip()
            
            centers.append(center)
    
    return centers

def parse_oferta(soup):
    """Extrae Oferta Formativa"""
    oferta = {"grado_c": [], "grado_d": [], "grado_e": []}
    if not soup:
        return oferta
    
    text = soup.get_text()
    
    # Buscar enlaces de cada grado
    for link in soup.find_all('a', href=True):
        href = link.get('href', '')
        link_text = link.get_text(strip=True)
        
        if 'Grado C' in link_text or 'Certificado profesional' in link_text:
            oferta["grado_c"].append({"name": link_text, "url": href})
        elif 'Grado D' in link_text or 'Ciclos formativos' in link_text:
            oferta["grado_d"].append({"name": link_text, "url": href})
        elif 'Grado E' in link_text or 'especialización' in link_text.lower():
            oferta["grado_e"].append({"name": link_text, "url": href})
    
    return oferta

def scrape_family(family_slug, url_slug):
    """Scrapea todos los datos de una familia"""
    print(f"\n{'='*60}")
    print(f"Scrapeando: {family_slug} (URL slug: {url_slug})")
    print(f"{'='*60}")
    
    data = {
        "description": "",
        "oferta_grado_c": [],
        "oferta_grado_d": [],
        "oferta_grado_e": [],
        "crn_centers": [],
        "ecp_nivel_1": [],
        "ecp_nivel_2": [],
        "ecp_nivel_3": [],
    }
    
    # 1. ECP Nivel 1
    url = f"{BASE_URL}/{url_slug}_ecp-nivel-1"
    print(f"  [1/5] ECP Nivel 1: {url}")
    soup = get_soup(url)
    data["ecp_nivel_1"] = parse_ecp_items(soup, 1)
    print(f"    -> {len(data['ecp_nivel_1'])} estándares encontrados")
    time.sleep(0.5)
    
    # 2. ECP Nivel 2
    url = f"{BASE_URL}/{url_slug}_ecp-nivel-2"
    print(f"  [2/5] ECP Nivel 2: {url}")
    soup = get_soup(url)
    data["ecp_nivel_2"] = parse_ecp_items(soup, 2)
    print(f"    -> {len(data['ecp_nivel_2'])} estándares encontrados")
    time.sleep(0.5)
    
    # 3. ECP Nivel 3
    url = f"{BASE_URL}/{url_slug}_ecp-nivel-3"
    print(f"  [3/5] ECP Nivel 3: {url}")
    soup = get_soup(url)
    data["ecp_nivel_3"] = parse_ecp_items(soup, 3)
    print(f"    -> {len(data['ecp_nivel_3'])} estándares encontrados")
    time.sleep(0.5)
    
    # 4. CRN
    url = f"{BASE_URL}/{url_slug}_crn"
    print(f"  [4/5] CRN: {url}")
    soup = get_soup(url)
    data["crn_centers"] = parse_crn(soup)
    print(f"    -> {len(data['crn_centers'])} centros encontrados")
    time.sleep(0.5)
    
    # 5. Oferta Formativa
    url = f"{BASE_URL}/{url_slug}_ofertaformativa"
    print(f"  [5/5] Oferta Formativa: {url}")
    soup = get_soup(url)
    oferta = parse_oferta(soup)
    data["oferta_grado_c"] = oferta["grado_c"]
    data["oferta_grado_d"] = oferta["grado_d"]
    data["oferta_grado_e"] = oferta["grado_e"]
    print(f"    -> C:{len(oferta['grado_c'])} D:{len(oferta['grado_d'])} E:{len(oferta['grado_e'])}")
    
    return data

def main():
    db = SessionLocal()
    
    try:
        # Crear familias nuevas si no existen
        new_families = {
            "AAT": "Actividades y Competencias Transversales",
            "IAD": "Inteligencia Artificial y Data",
            "MAP": "Marítimo-Pesquera",
            "VIC": "Vidrio y Cerámica",
        }
        
        for code, name in new_families.items():
            existing = db.query(ProfessionalFamily).filter(ProfessionalFamily.code == code).first()
            if not existing:
                print(f"Creando nueva familia: {code} - {name}")
                db.add(ProfessionalFamily(code=code, name=name))
        
        db.commit()
        
        # Scrape each family
        total = len(FAMILY_SLUGS)
        for idx, (code, slug) in enumerate(FAMILY_SLUGS.items(), 1):
            print(f"\n[{idx}/{total}] Procesando familia {code}...")
            
            # Get or create family
            family = db.query(ProfessionalFamily).filter(ProfessionalFamily.code == code).first()
            if not family:
                print(f"  WARNING: Familia {code} no encontrada en BD, saltando...")
                continue
            
            url_slug = INCUAL_URL_SLUGS.get(slug, slug)
            
            # Check if already scraped
            existing = db.query(IncualFamilyData).filter(IncualFamilyData.family_id == family.id).first()
            if existing and existing.scrape_status == "complete":
                print(f"  Ya scrapeado anteriormente, saltando...")
                continue
            
            # Scrape
            data = scrape_family(slug, url_slug)
            
            # Save to DB
            if existing:
                existing.description = data.get("description", "")
                existing.oferta_grado_c = data["oferta_grado_c"]
                existing.oferta_grado_d = data["oferta_grado_d"]
                existing.oferta_grado_e = data["oferta_grado_e"]
                existing.crn_centers = data["crn_centers"]
                existing.ecp_nivel_1 = data["ecp_nivel_1"]
                existing.ecp_nivel_2 = data["ecp_nivel_2"]
                existing.ecp_nivel_3 = data["ecp_nivel_3"]
                existing.last_scraped = datetime.now(timezone.utc)
                existing.scrape_status = "complete"
            else:
                incual_data = IncualFamilyData(
                    family_id=family.id,
                    incual_slug=slug,
                    description=data.get("description", ""),
                    oferta_grado_c=data["oferta_grado_c"],
                    oferta_grado_d=data["oferta_grado_d"],
                    oferta_grado_e=data["oferta_grado_e"],
                    crn_centers=data["crn_centers"],
                    ecp_nivel_1=data["ecp_nivel_1"],
                    ecp_nivel_2=data["ecp_nivel_2"],
                    ecp_nivel_3=data["ecp_nivel_3"],
                    last_scraped=datetime.now(timezone.utc),
                    scrape_status="complete"
                )
                db.add(incual_data)
            
            db.commit()
            print(f"  GUARDADO en BD")
            
            # Rate limiting
            time.sleep(1)
        
        # Summary
        print(f"\n{'='*60}")
        print("RESUMEN FINAL:")
        print(f"{'='*60}")
        total_records = db.query(IncualFamilyData).count()
        complete_records = db.query(IncualFamilyData).filter(IncualFamilyData.scrape_status == "complete").count()
        print(f"Total familias scrapeadas: {total_records}")
        print(f"Completas: {complete_records}")
        
        # Show ECP counts
        for fam_data in db.query(IncualFamilyData).all():
            family = db.query(ProfessionalFamily).filter(ProfessionalFamily.id == fam_data.family_id).first()
            n1 = len(fam_data.ecp_nivel_1 or [])
            n2 = len(fam_data.ecp_nivel_2 or [])
            n3 = len(fam_data.ecp_nivel_3 or [])
            crn = len(fam_data.crn_centers or [])
            print(f"  {family.code}: ECP1={n1}, ECP2={n2}, ECP3={n3}, CRN={crn}")
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
