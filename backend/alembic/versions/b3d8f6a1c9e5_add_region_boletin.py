"""Boletín oficial de cada comunidad autónoma (BOA, BOJA, DOGC…) en regions.

Revision ID: b3d8f6a1c9e5
Revises: a2c7e5b9d1f3
Create Date: 2026-11-21
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'b3d8f6a1c9e5'
down_revision: Union[str, Sequence[str], None] = 'a2c7e5b9d1f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    cols = [c['name'] for c in sa.inspect(op.get_bind()).get_columns('regions')]
    if 'boletin' not in cols:
        with op.batch_alter_table('regions') as b:
            b.add_column(sa.Column('boletin', sa.String(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('regions') as b:
        b.drop_column('boletin')
