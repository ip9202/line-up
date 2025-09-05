from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.utils.database import Base

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    city = Column(String(50), nullable=True)  # 도시명 (예: 서울, 부산)
    league = Column(String(50), nullable=True)  # 리그 (예: KBO, MLB)
    is_active = Column(Boolean, default=True)
    is_our_team = Column(Boolean, default=False)  # 우리팀 여부
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Team(id={self.id}, name='{self.name}', city='{self.city}')>"
