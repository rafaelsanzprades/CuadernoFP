import sqlite3
from database import engine, Base
from models import ModuleDocument, DidacticUnit, SessionModel, LearningOutcomeItem, EvaluationCriterionItem, ActivityItem, InstrumentItem, TaskItem, AceItem, DuaItem, ContingencyItem, CalendarNoteItem, ConfigDates, ScheduleItem, ModuleInfo, PlanningLedgerItem
from sqlalchemy.orm import Session

session = Session(bind=engine)

docs = session.query(ModuleDocument).all()

for doc in docs:
    if "-curso-" in doc.id:
        doc.doc_type = "curso"
        # Extract the base module prefix. e.g. "0237-ictve-curso-2025-26" -> "0237-ictve-pd"
        # Split by '-curso-'
        parts = doc.id.split('-curso-')
        if len(parts) == 2:
            base_prefix = parts[0]
            doc.parent_id = f"{base_prefix}-pd"
            
            # Since this is a course, we should delete its theoretical data 
            # to avoid duplication and force it to read from the parent PD.
            curso_id = doc.id
            session.query(DidacticUnit).filter_by(module_document_id=curso_id).delete()
            session.query(SessionModel).filter_by(module_document_id=curso_id).delete()
            session.query(LearningOutcomeItem).filter_by(module_document_id=curso_id).delete()
            session.query(EvaluationCriterionItem).filter_by(module_document_id=curso_id).delete()
            session.query(ActivityItem).filter_by(module_document_id=curso_id).delete()
            session.query(InstrumentItem).filter_by(module_document_id=curso_id).delete()
            session.query(TaskItem).filter_by(module_document_id=curso_id).delete()
            session.query(AceItem).filter_by(module_document_id=curso_id).delete()
            session.query(DuaItem).filter_by(module_document_id=curso_id).delete()
            session.query(ContingencyItem).filter_by(module_document_id=curso_id).delete()
            session.query(CalendarNoteItem).filter_by(module_document_id=curso_id).delete()
            session.query(ConfigDates).filter_by(module_document_id=curso_id).delete()
            session.query(ScheduleItem).filter_by(module_document_id=curso_id).delete()
            session.query(ModuleInfo).filter_by(module_document_id=curso_id).delete()
            session.query(PlanningLedgerItem).filter_by(module_document_id=curso_id).delete()

    else:
        doc.doc_type = "pd"
        doc.parent_id = None

session.commit()
session.close()

print("Parent-Child linking complete. Orphan theoretical data from courses has been deleted.")
