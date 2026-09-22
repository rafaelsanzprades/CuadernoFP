"""drop attendance_records -- migrado a local (Item 45)

La asistencia vivía en la tabla attendance_records del servidor, contradiciendo
la promesa "el servidor es ciego" (ver 00 IDEAS.md, Item 45, y 01 Historico.md,
2026-09-22). Pasa a vivir en cursoData.attendance_ledger, como el resto del
curso (notas, calificaciones, etc.).

Nota: el autogenerate de Alembic detecto tambien varias tablas huerfanas de un
diseno antiguo (users, enrollments, course_groups, dual_coordinators, etc.)
que existen en la BD pero no en models.py -- no se tocan aqui, son ajenas a
este cambio y su eliminacion (si procede) es una decision aparte.

Revision ID: 434b59934b4b
Revises: 0222ab355bfd
Create Date: 2026-09-22 11:02:10.547864

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '434b59934b4b'
down_revision: Union[str, Sequence[str], None] = '0222ab355bfd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_index('ix_attendance_records_date_str', table_name='attendance_records')
    op.drop_index('ix_attendance_records_id', table_name='attendance_records')
    op.drop_index('ix_attendance_records_module_document_id', table_name='attendance_records')
    op.drop_index('ix_attendance_records_student_id', table_name='attendance_records')
    op.drop_table('attendance_records')


def downgrade() -> None:
    """Downgrade schema."""
    op.create_table('attendance_records',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('module_document_id', sa.VARCHAR(), nullable=True),
    sa.Column('student_id', sa.VARCHAR(), nullable=True),
    sa.Column('date_str', sa.VARCHAR(), nullable=True),
    sa.Column('status', sa.VARCHAR(), nullable=True),
    sa.ForeignKeyConstraint(['module_document_id'], ['module_documents.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_attendance_records_student_id', 'attendance_records', ['student_id'], unique=False)
    op.create_index('ix_attendance_records_module_document_id', 'attendance_records', ['module_document_id'], unique=False)
    op.create_index('ix_attendance_records_id', 'attendance_records', ['id'], unique=False)
    op.create_index('ix_attendance_records_date_str', 'attendance_records', ['date_str'], unique=False)
