"""Ámbito de cada módulo: estatal (BOE) o autonómico (propio de una comunidad).

Los módulos con código A… (tutorías, PRL y módulos propios de Aragón), AOP… (optativos de Aragón) y OPT (hueco de optativa)
no vienen del real decreto del título.

Revision ID: d5f1b8c3a7e2
Revises: c4e9a7b2d6f1
Create Date: 2026-11-21
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'd5f1b8c3a7e2'
down_revision: Union[str, Sequence[str], None] = 'c4e9a7b2d6f1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    cols = [c['name'] for c in sa.inspect(op.get_bind()).get_columns('modules')]
    with op.batch_alter_table('modules') as b:
        if 'ambito' not in cols:
            b.add_column(sa.Column('ambito', sa.String(), nullable=False, server_default='estatal'))
        if 'region_id' not in cols:
            b.add_column(sa.Column('region_id', sa.Integer(), sa.ForeignKey('regions.id', name='fk_modules_region'), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('modules') as b:
        b.drop_column('region_id')
        b.drop_column('ambito')
