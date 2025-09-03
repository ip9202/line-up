from sqlalchemy import Column, Integer, String, Date, Time, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.utils.database import Base

class Game(Base):
    __tablename__ = "games"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)
    venue = Column(String(200), nullable=False)
    opponent = Column(String(100), nullable=False)
    game_type = Column(String(20), default="REGULAR")  # REGULAR, PLAYOFF, FRIENDLY
    status = Column(String(20), default="SCHEDULED")   # SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 관계
    lineups = relationship("Lineup", back_populates="game", cascade="all, delete-orphan")
