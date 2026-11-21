"""Procedencia y verificación de los datos del currículo (títulos, RA y CE).

degrees: norma de origen (real decreto), enlace al BOE, fecha de verificación y notas.
learning_outcomes / evaluation_criteria: estado de cotejo con el BOE.

Revision ID: e5a8c2d1f7b3
Revises: 434b59934b4b
Create Date: 2026-11-21
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'e5a8c2d1f7b3'
down_revision: Union[str, Sequence[str], None] = '434b59934b4b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('degrees') as b:
        b.add_column(sa.Column('fuente_norma', sa.String(), nullable=True))
        b.add_column(sa.Column('fuente_url', sa.String(), nullable=True))
        b.add_column(sa.Column('verificado_el', sa.String(), nullable=True))
        b.add_column(sa.Column('verificacion', sa.String(), nullable=True))
    with op.batch_alter_table('learning_outcomes') as b:
        b.add_column(sa.Column('cotejo_boe', sa.String(), nullable=True))
    with op.batch_alter_table('evaluation_criteria') as b:
        b.add_column(sa.Column('cotejo_boe', sa.String(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('evaluation_criteria') as b:
        b.drop_column('cotejo_boe')
    with op.batch_alter_table('learning_outcomes') as b:
        b.drop_column('cotejo_boe')
    with op.batch_alter_table('degrees') as b:
        b.drop_column('verificacion')
        b.drop_column('verificado_el')
        b.drop_column('fuente_url')
        b.drop_column('fuente_norma')
