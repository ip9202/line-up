"""add_is_our_team_column_to_teams

Revision ID: fe8520a9409e
Revises: a66b3485a93b
Create Date: 2025-09-05 14:34:35.255445

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fe8520a9409e'
down_revision: Union[str, Sequence[str], None] = 'a66b3485a93b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add is_our_team column to teams table
    op.add_column('teams', sa.Column('is_our_team', sa.Boolean(), nullable=True, default=False))


def downgrade() -> None:
    """Downgrade schema."""
    # Remove is_our_team column from teams table
    op.drop_column('teams', 'is_our_team')
