"""Notas de cotejo y enlace a la fuente por módulo; notas de cotejo por RA y CE.

modules: fuente_url (enlace al BOE de donde salen sus RA y CE; puede ser un real decreto de modificación o una orden y no
el del título), verificado_el (fecha del último cotejo) y nota_cotejo (dificultades y particularidades de ese cotejo).
learning_outcomes / evaluation_criteria: nota_cotejo (duda concreta o errata del propio BOE).

Revision ID: e7b2c9d4a1f6
Revises: d5f1b8c3a7e2
Create Date: 2026-11-23
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'e7b2c9d4a1f6'
down_revision: Union[str, Sequence[str], None] = 'd5f1b8c3a7e2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _anade(tabla: str, columnas: list[str]) -> None:
    existentes = [c['name'] for c in sa.inspect(op.get_bind()).get_columns(tabla)]
    with op.batch_alter_table(tabla) as b:
        for nombre in columnas:
            if nombre not in existentes:
                b.add_column(sa.Column(nombre, sa.String(), nullable=True))


def upgrade() -> None:
    _anade('modules', ['fuente_url', 'verificado_el', 'nota_cotejo'])
    _anade('learning_outcomes', ['nota_cotejo'])
    _anade('evaluation_criteria', ['nota_cotejo'])


def downgrade() -> None:
    with op.batch_alter_table('evaluation_criteria') as b:
        b.drop_column('nota_cotejo')
    with op.batch_alter_table('learning_outcomes') as b:
        b.drop_column('nota_cotejo')
    with op.batch_alter_table('modules') as b:
        b.drop_column('nota_cotejo')
        b.drop_column('verificado_el')
        b.drop_column('fuente_url')
