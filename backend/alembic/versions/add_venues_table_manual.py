"""Add venues table and update games table

Revision ID: add_venues_manual
Revises: update_games_table_manual
Create Date: 2025-01-03 09:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_venues_manual'
down_revision = 'update_games_table_manual'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create venues table
    op.execute("""
        CREATE TABLE IF NOT EXISTS venues (
            id SERIAL PRIMARY KEY,
            name VARCHAR(200) NOT NULL UNIQUE,
            location VARCHAR(200),
            capacity INTEGER,
            surface_type VARCHAR(50),
            is_indoor BOOLEAN DEFAULT false,
            notes TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE
        )
    """)

    # Create indexes for venues table
    op.execute("CREATE INDEX IF NOT EXISTS ix_venues_id ON venues (id)")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_venues_name ON venues (name)")

    # Add venue_id column to games table (nullable first)
    op.add_column('games', sa.Column('venue_id', sa.Integer(), nullable=True))

    # Create a default venue for existing games
    op.execute("""
        INSERT INTO venues (name, location, is_active) 
        VALUES ('기본 경기장', '미정', true)
        ON CONFLICT (name) DO NOTHING
    """)

    # Set default venue_id for existing games
    op.execute("""
        UPDATE games 
        SET venue_id = (SELECT id FROM venues WHERE name = '기본 경기장' LIMIT 1)
        WHERE venue_id IS NULL
    """)

    # Make venue_id not nullable
    op.alter_column('games', 'venue_id', nullable=False)

    # Drop old venue column
    op.drop_column('games', 'venue')


def downgrade() -> None:
    """Downgrade schema."""
    # Add back venue column
    op.add_column('games', sa.Column('venue', sa.VARCHAR(length=200), autoincrement=False, nullable=True))
    
    # Migrate data back: get venue name from venues table
    op.execute("""
        UPDATE games 
        SET venue = (SELECT name FROM venues WHERE venues.id = games.venue_id)
        WHERE venue_id IS NOT NULL
    """)
    
    # Make venue column not nullable
    op.alter_column('games', 'venue', nullable=False)
    
    # Drop venue_id column
    op.drop_column('games', 'venue_id')
    
    # Drop venues table
    op.drop_table('venues')
