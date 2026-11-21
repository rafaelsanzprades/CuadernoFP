"""Horas y curso de cada módulo por comunidad autónoma.

El Estado solo fija las horas totales del título; el reparto por módulo y por curso lo concreta cada comunidad.
modules.hours y modules.curso quedan como los valores de Aragón; module_ccaa permite añadir otras comunidades.

Revision ID: f1b6d3e9a2c4
Revises: e5a8c2d1f7b3
Create Date: 2026-11-21
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'f1b6d3e9a2c4'
down_revision: Union[str, Sequence[str], None] = 'e5a8c2d1f7b3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'module_ccaa',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('module_id', sa.Integer(), sa.ForeignKey('modules.id'), nullable=False),
        sa.Column('region_id', sa.Integer(), sa.ForeignKey('regions.id'), nullable=False),
        sa.Column('hours', sa.Integer(), nullable=True),
        sa.Column('curso', sa.String(), nullable=True),
        sa.Column('fuente', sa.String(), nullable=True),
        sa.Column('verificado_el', sa.String(), nullable=True),
        sa.UniqueConstraint('module_id', 'region_id', name='uq_module_ccaa'),
    )
    op.create_index('ix_module_ccaa_module_id', 'module_ccaa', ['module_id'])


def downgrade() -> None:
    op.drop_index('ix_module_ccaa_module_id', table_name='module_ccaa')
    op.drop_table('module_ccaa')
