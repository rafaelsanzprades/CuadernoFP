import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('models.py', 'r', encoding='utf-8-sig') as f:
    content = f.read()

old = 'degrees = relationship("Degree", back_populates="family")\n\nclass Degree(Base):'

new = '''degrees = relationship("Degree", back_populates="family")
    incual_data = relationship("IncualFamilyData", back_populates="family", uselist=False)

class IncualFamilyData(Base):
    """Datos ECP del INCUAL por familia profesional"""
    __tablename__ = "incual_family_data"
    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("professional_families.id"), unique=True)
    incual_slug = Column(String, unique=True)
    description = Column(String, nullable=True)
    oferta_grado_c = Column(JSON, default=[])
    oferta_grado_d = Column(JSON, default=[])
    oferta_grado_e = Column(JSON, default=[])
    crn_centers = Column(JSON, default=[])
    ecp_nivel_1 = Column(JSON, default=[])
    ecp_nivel_2 = Column(JSON, default=[])
    ecp_nivel_3 = Column(JSON, default=[])
    last_scraped = Column(DateTime, nullable=True)
    scrape_status = Column(String, default="pending")
    family = relationship("ProfessionalFamily", back_populates="incual_data")

class Degree(Base):'''

if old in content:
    content = content.replace(old, new, 1)
    with open('models.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print('OK: Modelo IncualFamilyData insertado correctamente')
else:
    print('ERROR: contenido no encontrado')
    idx = content.find('degrees = relationship')
    print(f'Index: {idx}')
    print(repr(content[idx:idx+80]))
