from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.utils.database import Base

class LineupPlayer(Base):
    __tablename__ = "lineup_players"
    
    id = Column(Integer, primary_key=True, index=True)
    lineup_id = Column(Integer, ForeignKey("lineups.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    position = Column(String(20), nullable=False)
    batting_order = Column(Integer, nullable=False)
    is_starter = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 관계
    lineup = relationship("Lineup", back_populates="lineup_players")
    player = relationship("Player")
    
    # 제약조건
    __table_args__ = (
        UniqueConstraint('lineup_id', 'position', name='uq_lineup_position'),
        UniqueConstraint('lineup_id', 'batting_order', name='uq_lineup_batting_order'),
        CheckConstraint('batting_order >= 0 AND batting_order <= 9', name='ck_batting_order_range')
    )
