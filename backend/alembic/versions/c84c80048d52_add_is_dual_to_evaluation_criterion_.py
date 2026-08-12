"""add is_dual to evaluation criterion items

Revision ID: c84c80048d52
Revises: b7e2d5f1a9c3
Create Date: 2026-08-12 12:45:13.983362

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c84c80048d52'
down_revision: Union[str, Sequence[str], None] = 'b7e2d5f1a9c3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('evaluation_criterion_items', sa.Column('is_dual', sa.Boolean(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('evaluation_criterion_items', 'is_dual')
