"""Update games table to use single game_date field

Revision ID: update_games_table_manual
Revises: add_teams_table_manual
Create Date: 2025-01-03 08:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'update_games_table_manual'
down_revision = 'add_teams_manual'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add new game_date column (nullable first)
    op.add_column('games', sa.Column('game_date', sa.DateTime(), nullable=True))
    
    # Migrate existing data: combine date and time into game_date
    op.execute("""
        UPDATE games 
        SET game_date = (date + time)::timestamp 
        WHERE date IS NOT NULL AND time IS NOT NULL
    """)
    
    # Make game_date not nullable
    op.alter_column('games', 'game_date', nullable=False)
    
    # Drop old columns
    op.drop_column('games', 'time')
    op.drop_column('games', 'date')


def downgrade() -> None:
    """Downgrade schema."""
    # Add back date and time columns
    op.add_column('games', sa.Column('date', sa.DATE(), autoincrement=False, nullable=True))
    op.add_column('games', sa.Column('time', sa.TIME(), autoincrement=False, nullable=True))
    
    # Migrate data back: split game_date into date and time
    op.execute("""
        UPDATE games 
        SET date = game_date::date, time = game_date::time 
        WHERE game_date IS NOT NULL
    """)
    
    # Make columns not nullable
    op.alter_column('games', 'date', nullable=False)
    op.alter_column('games', 'time', nullable=False)
    
    # Drop game_date column
    op.drop_column('games', 'game_date')
