"""Páginas oficiales de normativa de FP de cada comunidad (según TodoFP) y estado de su índice de currículos.

Revision ID: c4e9a7b2d6f1
Revises: b3d8f6a1c9e5
Create Date: 2026-11-21
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'c4e9a7b2d6f1'
down_revision: Union[str, Sequence[str], None] = 'b3d8f6a1c9e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    cols = [c['name'] for c in sa.inspect(op.get_bind()).get_columns('regions')]
    with op.batch_alter_table('regions') as b:
        for nombre in ('url_normativa_fp', 'url_indice_curriculos', 'indice_curriculos', 'fuente_url', 'nota'):
            if nombre not in cols:
                b.add_column(sa.Column(nombre, sa.String(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('regions') as b:
        for nombre in ('nota', 'fuente_url', 'indice_curriculos', 'url_indice_curriculos', 'url_normativa_fp'):
            b.drop_column(nombre)
