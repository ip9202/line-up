"""add_teams_table_manual

Revision ID: add_teams_manual
Revises: fb21fe6b7cef
Create Date: 2025-01-03 16:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'add_teams_manual'
down_revision: Union[str, Sequence[str], None] = 'fb21fe6b7cef'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create teams table (if not exists)
    op.execute("""
        CREATE TABLE IF NOT EXISTS teams (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            city VARCHAR(50),
            league VARCHAR(50),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE
        )
    """)
    
    # Create indexes for teams table
    op.execute("CREATE INDEX IF NOT EXISTS ix_teams_id ON teams (id)")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_teams_name ON teams (name)")
    
    # Add new columns to games table (nullable first)
    op.add_column('games', sa.Column('opponent_team_id', sa.Integer(), nullable=True))
    op.add_column('games', sa.Column('is_home', sa.Boolean(), nullable=True))
    
    # Set default values for existing games
    op.execute("UPDATE games SET opponent_team_id = 1, is_home = true WHERE opponent_team_id IS NULL")
    
    # Make columns not nullable
    op.alter_column('games', 'opponent_team_id', nullable=False)
    op.alter_column('games', 'is_home', nullable=False)
    
    # Drop old opponent column
    op.drop_column('games', 'opponent')


def downgrade() -> None:
    """Downgrade schema."""
    # Add back opponent column
    op.add_column('games', sa.Column('opponent', sa.String(length=100), nullable=False))
    
    # Drop new columns
    op.drop_column('games', 'is_home')
    op.drop_column('games', 'opponent_team_id')
    
    # Drop teams table
    op.drop_index(op.f('ix_teams_name'), table_name='teams')
    op.drop_index(op.f('ix_teams_id'), table_name='teams')
    op.drop_table('teams')
