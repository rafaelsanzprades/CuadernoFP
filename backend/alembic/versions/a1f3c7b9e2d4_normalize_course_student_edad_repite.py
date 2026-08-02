"""normalize_course_student_edad_repite

Revision ID: a1f3c7b9e2d4
Revises: 86ee1317b86a
Create Date: 2026-08-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1f3c7b9e2d4'
down_revision: Union[str, Sequence[str], None] = '86ee1317b86a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    conn = op.get_bind()
    # Normalize existing text values to plain 0/1 before changing column affinity,
    # since SQLite only auto-casts text that already looks numeric.
    conn.execute(sa.text("UPDATE course_students SET edad = NULL WHERE edad IS NULL OR trim(edad) = '' OR lower(edad) = 'nan'"))
    conn.execute(sa.text("UPDATE course_students SET repite = '1' WHERE repite IS NOT NULL AND lower(trim(repite)) IN ('true', 'sí', 'si', '1')"))
    conn.execute(sa.text("UPDATE course_students SET repite = '0' WHERE repite IS NOT NULL AND lower(trim(repite)) NOT IN ('1')"))

    # SQLite doesn't support ALTER COLUMN for type changes
    # Use batch_alter_table with recreate_table
    with op.batch_alter_table('course_students') as batch_op:
        batch_op.alter_column('edad',
                             existing_type=sa.VARCHAR(),
                             type_=sa.Integer(),
                             existing_nullable=True)
        batch_op.alter_column('repite',
                             existing_type=sa.VARCHAR(),
                             type_=sa.Boolean(),
                             existing_nullable=True,
                             postgresql_using="repite IN ('true', 'True', 'Sí', 'Si', '1')")


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('course_students') as batch_op:
        batch_op.alter_column('edad',
                             existing_type=sa.Integer(),
                             type_=sa.VARCHAR(),
                             existing_nullable=True)
        batch_op.alter_column('repite',
                             existing_type=sa.Boolean(),
                             type_=sa.VARCHAR(),
                             existing_nullable=True)
