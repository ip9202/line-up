"""Remove lineup position unique constraint

Revision ID: remove_lineup_position_constraint
Revises: 7f975b3c5267
Create Date: 2025-01-04 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fix_lineup_constraint'
down_revision: Union[str, Sequence[str], None] = 'add_venues_manual'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Remove the unique constraints on lineup_id and position/batting_order."""
    # Drop the unique constraints that prevent multiple players in the same position or batting order
    op.drop_constraint('uq_lineup_position', 'lineup_players', type_='unique')
    op.drop_constraint('uq_lineup_batting_order', 'lineup_players', type_='unique')


def downgrade() -> None:
    """Re-add the unique constraints on lineup_id and position/batting_order."""
    # Re-add the unique constraints
    op.create_unique_constraint('uq_lineup_position', 'lineup_players', ['lineup_id', 'position'])
    op.create_unique_constraint('uq_lineup_batting_order', 'lineup_players', ['lineup_id', 'batting_order'])
