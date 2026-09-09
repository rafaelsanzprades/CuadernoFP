"""drop dead is_dual column from modules

Revision ID: 0222ab355bfd
Revises: c84c80048d52
Create Date: 2026-09-09 15:31:29.923884

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0222ab355bfd'
down_revision: Union[str, Sequence[str], None] = 'c84c80048d52'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Dead catalog-level field: never read by backend or frontend, not exposed by
    # the catalogs API. Not to be confused with the actively-used `is_dual` on
    # learning_outcome_items/evaluation_criterion_items (per-programación FEOE flag).
    with op.batch_alter_table('modules') as batch_op:
        batch_op.drop_column('is_dual')


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table('modules') as batch_op:
        batch_op.add_column(sa.Column('is_dual', sa.Boolean(), nullable=True, server_default=sa.true()))
