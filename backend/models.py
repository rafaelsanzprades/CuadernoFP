from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, JSON, DateTime, Enum, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base

class Titularidad(enum.Enum):
    PUBLICA = "Pública"
    CONCERTADA = "Concertada"
    PRIVADA = "Privada"

class NivelFP(enum.Enum):
    GRADO_A = "Grado A (Microacreditación)"
    GRADO_B = "Grado B (Certificado de Competencia)"
    GRADO_C = "Grado C (Certificado Profesional)"
    BASICA = "Grado Básico" # Grado D
    MEDIO = "Grado Medio" # Grado D
    SUPERIOR = "Grado Superior" # Grado D
    ESPECIALIZACION = "Curso de Especialización" # Grado E



# ==========================================
# 1. MAESTROS Y TERRITORIO
# ==========================================
class Region(Base):
    __tablename__ = "regions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False) # ej: Aragón
    provinces = relationship("Province", back_populates="region")
    degrees = relationship("Degree", back_populates="region")

class Province(Base):
    __tablename__ = "provinces"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    region_id = Column(Integer, ForeignKey("regions.id"))
    region = relationship("Region", back_populates="provinces")
    cities = relationship("City", back_populates="province")

class City(Base):
    __tablename__ = "cities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    province_id = Column(Integer, ForeignKey("provinces.id"))
    province = relationship("Province", back_populates="cities")

# ==========================================
# 2. FAMILIAS PROFESIONALES Y CURRÍCULO
# ==========================================
class ProfessionalFamily(Base):
    __tablename__ = "professional_families"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True) # ej: IFC para Informática
    name = Column(String, nullable=False)
    icon_url = Column(String) # Icono de eligetuprofesion.aragon.es
    color_hex = Column(String)
    degrees = relationship("Degree", back_populates="family")
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

class Degree(Base):
    __tablename__ = "degrees"
    id = Column(Integer, primary_key=True, index=True)
    family_id = Column(Integer, ForeignKey("professional_families.id"))
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=True) # None = Estatal (BOE)
    level = Column(Enum(NivelFP), nullable=False)
    name = Column(String, nullable=False)
    hours = Column(Integer)
    code = Column(String, index=True)  # código del currículo, ej: ELE203
    boa_articles = Column(JSON, default={})
    
    family = relationship("ProfessionalFamily", back_populates="degrees")
    region = relationship("Region", back_populates="degrees")
    modules = relationship("Module", back_populates="degree")

class Module(Base):
    __tablename__ = "modules"
    id = Column(Integer, primary_key=True, index=True)
    degree_id = Column(Integer, ForeignKey("degrees.id"))
    code = Column(String) # ej: 0484
    name = Column(String, nullable=False) # ej: Bases de Datos
    hours = Column(Integer)
    curso = Column(String, nullable=True) # ej: "1º", "2º", "Ambos"
    is_dual = Column(Boolean, default=True) # Sujeto a FEOE
    convalidation_competences = Column(String, nullable=True) # JSON con datos de Catedu
    
    degree = relationship("Degree", back_populates="modules")
    learning_outcomes = relationship("LearningOutcome", back_populates="module", cascade="all, delete-orphan")

class LearningOutcome(Base):
    __tablename__ = "learning_outcomes"
    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"))
    ra_number = Column(Integer) # e.g., 9 for "RA9"
    description = Column(String, nullable=False) # e.g., "Desarrolla..."
    ecp_code = Column(String, nullable=True) # e.g., "UC1077_2" vinculado al INCUAL
    
    module = relationship("Module", back_populates="learning_outcomes")
    evaluation_criteria = relationship("EvaluationCriterion", back_populates="learning_outcome", cascade="all, delete-orphan")

class EvaluationCriterion(Base):
    __tablename__ = "evaluation_criteria"
    id = Column(Integer, primary_key=True, index=True)
    learning_outcome_id = Column(Integer, ForeignKey("learning_outcomes.id"))
    ce_code = Column(String, nullable=False) # e.g., "CE1.1" or "a)"
    description = Column(String, nullable=False)
    
    learning_outcome = relationship("LearningOutcome", back_populates="evaluation_criteria")

# ==========================================
# 3. CENTROS EDUCATIVOS
# ==========================================
# Tabla asociativa para Centros y Títulos (Qué imparte cada centro)
center_degrees_table = Table(
    'center_degrees', Base.metadata,
    Column('center_id', Integer, ForeignKey('centers.id'), primary_key=True),
    Column('degree_id', Integer, ForeignKey('degrees.id'), primary_key=True)
)

class Center(Base):
    __tablename__ = "centers"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True) # Código oficial del centro
    name = Column(String, nullable=False)
    titularity = Column(Enum(Titularidad), nullable=False, default=Titularidad.PUBLICA)
    city_id = Column(Integer, ForeignKey("cities.id"))
    
    degrees = relationship("Degree", secondary=center_degrees_table)

# ==========================================
# COMPATIBILIDAD CON SISTEMA JSON ANTERIOR
# ==========================================
class ModuleDocument(Base):
    __tablename__ = "module_documents"
    id = Column(String, primary_key=True, index=True)
    doc_type = Column(String, default="pd") # "pd" or "curso"
    parent_id = Column(String, ForeignKey("module_documents.id"), nullable=True)
    data = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# ==========================================
# 5. NORMALIZED JSON DATA TABLES
# ==========================================
class DidacticUnit(Base):
    __tablename__ = "didactic_units"
    id = Column(Integer, primary_key=True, index=True)
    module_document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), index=True)
    id_ud = Column(String, index=True)
    desc_ud = Column(String)
    horas_ud = Column(Integer)
    ra_mappings = Column(JSON, default={})

class SessionModel(Base):
    __tablename__ = "sessions"
    id = Column(Integer, primary_key=True, index=True)
    module_document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), index=True)
    session_id = Column(String)
    id_ud = Column(String, index=True)
    num_orden = Column(Integer)
    horas = Column(Integer)
    tipo_actividad = Column(String)
    ra_ce = Column(String)
    contenidos = Column(String)
    aspectos_clave = Column(String)
    recursos = Column(String)

class CourseStudent(Base):
    __tablename__ = "course_students"
    id = Column(Integer, primary_key=True, index=True)
    module_document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), index=True)
    student_id = Column(String, index=True)
    estado = Column(String)
    apellidos = Column(String)
    nombre = Column(String)
    edad = Column(Integer, nullable=True)
    nacimiento = Column(String)
    repite = Column(Boolean, default=False)
    matricula = Column(String)
    comentarios = Column(String)
    email = Column(String)
    movil = Column(String)

class StudentEvaluation(Base):
    __tablename__ = "student_evaluations"
    id = Column(Integer, primary_key=True, index=True)
    module_document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), index=True)
    student_id = Column(String, index=True)
    eval_data = Column(JSON, default={})

# ==========================================
# 6. NORMALIZED JSON DATA TABLES (PHASE 2)
# ==========================================
class LearningOutcomeItem(Base):
    __tablename__ = "learning_outcome_items"
    id = Column(Integer, primary_key=True, index=True)
    module_document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), index=True)
    id_ra = Column(String, index=True)
    desc_ra = Column(String)
    peso_ra = Column(Integer, nullable=True)
    is_dual = Column(Boolean, default=False)
    data = Column(JSON, default={})

class EvaluationCriterionItem(Base):
    __tablename__ = "evaluation_criterion_items"
    id = Column(Integer, primary_key=True, index=True)
    module_document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), index=True)
    id_ce = Column(String, index=True)
    id_ra = Column(String, index=True)
    id_ud = Column(String)
    desc_ce = Column(String)
    peso_ce = Column(Integer, nullable=True)
    data = Column(JSON, default={})

class ActivityItem(Base):
    __tablename__ = "activity_items"
    id = Column(Integer, primary_key=True, index=True)
    module_document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), index=True)
    id_act = Column(String, index=True)
    desc_act = Column(String)
    tipo = Column(String)
    tri_act = Column(String)
    peso_act = Column(String)
    is_active = Column(String)
    data = Column(JSON, default={})

class InstrumentItem(Base):
    __tablename__ = "instrument_items"
    id = Column(Integer, primary_key=True, index=True)
    module_document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), index=True)
    item_id = Column(String, index=True)
    practica = Column(String)
    data = Column(JSON, default={})

class TaskItem(Base):
    __tablename__ = "task_items"
    id = Column(Integer, primary_key=True, index=True)
    module_document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), index=True)
    item_id = Column(String, index=True)
    nombre_tarea = Column(String)
    reto = Column(String)
    ra_asociados = Column(String)
    instrumento = Column(String)
    data = Column(JSON, default={})

class AceItem(Base):
    __tablename__ = "ace_items"
    id = Column(Integer, primary_key=True, index=True)
    module_document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), index=True)
    item_id = Column(String, index=True)
    tipo = Column(String)
    data = Column(JSON, default={})

class DuaItem(Base):
    __tablename__ = "dua_items"
    id = Column(Integer, primary_key=True, index=True)
    module_document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), index=True)
    item_id = Column(String, index=True)
    barrera = Column(String)
    data = Column(JSON, default={})

class ContingencyItem(Base):
    __tablename__ = "contingency_items"
    id = Column(Integer, primary_key=True, index=True)
    module_document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), index=True)
    item_id = Column(String, index=True)
    escenario = Column(String)
    data = Column(JSON, default={})

class FeoeItem(Base):
    __tablename__ = "feoe_items"
    id = Column(Integer, primary_key=True, index=True)
    module_document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), index=True)
    item_id = Column(String, index=True)
    data = Column(JSON, default={})

class SgmtItem(Base):
    __tablename__ = "sgmt_items"
    id = Column(Integer, primary_key=True, index=True)
    module_document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), index=True)
    id_ud = Column(String, index=True)
    data = Column(JSON, default={})

class CalendarNoteItem(Base):
    __tablename__ = "calendar_note_items"
    id = Column(Integer, primary_key=True, index=True)
    module_document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), index=True)
    note_key = Column(String, index=True)
    note_text = Column(String)

# ==========================================
# 7. NORMALIZED JSON DATA TABLES (PHASE 3)
# ==========================================

class ConfigDates(Base):
    __tablename__ = "config_dates"
    id = Column(Integer, primary_key=True, index=True)
    module_document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), unique=True)
    data = Column(JSON, default={})

class ScheduleItem(Base):
    __tablename__ = "schedule_items"
    id = Column(Integer, primary_key=True, index=True)
    module_document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), index=True)
    day_of_week = Column(String, index=True)
    hours = Column(Integer, default=0)

class ModuleInfo(Base):
    __tablename__ = "module_infos"
    id = Column(Integer, primary_key=True, index=True)
    module_document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), unique=True)
    data = Column(JSON, default={})

class PlanningLedgerItem(Base):
    __tablename__ = "planning_ledger_items"
    id = Column(Integer, primary_key=True, index=True)
    module_document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), index=True)
    date_str = Column(String, index=True)
    id_ud = Column(String)

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    id = Column(Integer, primary_key=True, index=True)
    module_document_id = Column(String, ForeignKey("module_documents.id", ondelete="CASCADE"), index=True)
    student_id = Column(String, index=True)
    date_str = Column(String, index=True)
    status = Column(String)
