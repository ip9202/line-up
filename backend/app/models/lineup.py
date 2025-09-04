from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.utils.database import Base

class Lineup(Base):
    __tablename__ = "lineups"
    
    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    name = Column(String(200), nullable=False)
    is_default = Column(Boolean, default=False)
    attendance_data = Column(Text, nullable=True)  # 출석 데이터를 JSON으로 저장
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 관계
    game = relationship("Game", back_populates="lineups")
    lineup_players = relationship("LineupPlayer", back_populates="lineup", cascade="all, delete-orphan")
