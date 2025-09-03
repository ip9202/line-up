from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.utils.database import Base

class Game(Base):
    __tablename__ = "games"
    
    id = Column(Integer, primary_key=True, index=True)
    game_date = Column(DateTime, nullable=False)
    venue_id = Column(Integer, nullable=False)  # 경기장 ID
    opponent_team_id = Column(Integer, nullable=False)  # 임시로 외래키 제거
    is_home = Column(Boolean, default=True)  # True: 홈경기, False: 어웨이경기
    game_type = Column(String(20), default="REGULAR")  # REGULAR, PLAYOFF, FRIENDLY
    status = Column(String(20), default="SCHEDULED")   # SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 관계
    # opponent_team = relationship("Team", foreign_keys=[opponent_team_id])  # 임시로 주석 처리
    lineups = relationship("Lineup", back_populates="game", cascade="all, delete-orphan")
