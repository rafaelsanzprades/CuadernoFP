"""normalize_peso_ra_ce_to_integer

Revision ID: b7e2d5f1a9c3
Revises: a1f3c7b9e2d4
Create Date: 2026-08-01 00:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7e2d5f1a9c3'
down_revision: Union[str, Sequence[str], None] = 'a1f3c7b9e2d4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    conn = op.get_bind()
    conn.execute(sa.text("UPDATE learning_outcome_items SET peso_ra = NULL WHERE peso_ra IS NULL OR trim(peso_ra) = '' OR lower(peso_ra) = 'nan'"))
    conn.execute(sa.text("UPDATE evaluation_criterion_items SET peso_ce = NULL WHERE peso_ce IS NULL OR trim(peso_ce) = '' OR lower(peso_ce) = 'nan'"))

    # SQLite doesn't support ALTER COLUMN for type changes
    # Use batch_alter_table with recreate_table
    with op.batch_alter_table('learning_outcome_items') as batch_op:
        batch_op.alter_column('peso_ra',
                             existing_type=sa.VARCHAR(),
                             type_=sa.Integer(),
                             existing_nullable=True)

    with op.batch_alter_table('evaluation_criterion_items') as batch_op:
        batch_op.alter_column('peso_ce',
                             existing_type=sa.VARCHAR(),
                             type_=sa.Integer(),
                             existing_nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('learning_outcome_items') as batch_op:
        batch_op.alter_column('peso_ra',
                             existing_type=sa.Integer(),
                             type_=sa.VARCHAR(),
                             existing_nullable=True)

    with op.batch_alter_table('evaluation_criterion_items') as batch_op:
        batch_op.alter_column('peso_ce',
                             existing_type=sa.Integer(),
                             type_=sa.VARCHAR(),
                             existing_nullable=True)
