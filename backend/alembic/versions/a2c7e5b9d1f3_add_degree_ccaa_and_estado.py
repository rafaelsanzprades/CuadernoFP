"""Currículo autonómico por título (boletín y enlaces) y estado de cada dato por comunidad.

degree_ccaa: una fila por título y comunidad con el boletín (BOA, etc.), la norma, los enlaces oficiales y el estado del dato.
module_ccaa: columnas estado y nota (verificado | heredado | no_disponible | a_completar).

Revision ID: a2c7e5b9d1f3
Revises: f1b6d3e9a2c4
Create Date: 2026-11-21
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'a2c7e5b9d1f3'
down_revision: Union[str, Sequence[str], None] = 'f1b6d3e9a2c4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'degree_ccaa',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('degree_id', sa.Integer(), sa.ForeignKey('degrees.id'), nullable=False),
        sa.Column('region_id', sa.Integer(), sa.ForeignKey('regions.id'), nullable=False),
        sa.Column('boletin', sa.String(), nullable=True),
        sa.Column('norma', sa.String(), nullable=True),
        sa.Column('url_curriculo', sa.String(), nullable=True),
        sa.Column('url_horario', sa.String(), nullable=True),
        sa.Column('url_horario_ley_fp', sa.String(), nullable=True),
        sa.Column('url_titulo_estatal', sa.String(), nullable=True),
        sa.Column('url_modificaciones', sa.JSON(), nullable=True),
        sa.Column('fuente', sa.String(), nullable=True),
        sa.Column('estado', sa.String(), nullable=False, server_default='a_completar'),
        sa.Column('nota', sa.String(), nullable=True),
        sa.Column('verificado_el', sa.String(), nullable=True),
        sa.UniqueConstraint('degree_id', 'region_id', name='uq_degree_ccaa'),
    )
    op.create_index('ix_degree_ccaa_degree_id', 'degree_ccaa', ['degree_id'])
    with op.batch_alter_table('module_ccaa') as b:
        b.add_column(sa.Column('estado', sa.String(), nullable=False, server_default='a_completar'))
        b.add_column(sa.Column('nota', sa.String(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('module_ccaa') as b:
        b.drop_column('nota')
        b.drop_column('estado')
    op.drop_index('ix_degree_ccaa_degree_id', table_name='degree_ccaa')
    op.drop_table('degree_ccaa')
