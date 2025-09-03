from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Date
from sqlalchemy.sql import func
from app.utils.database import Base

class Player(Base):
    __tablename__ = "players"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    number = Column(Integer, unique=True)
    phone = Column(String(20))
    email = Column(String(100))
    photo_url = Column(Text)
    
    # 확장 가능한 필드들 (향후 추가 예정)
    age = Column(Integer)
    birth_date = Column(Date)
    hometown = Column(String(100))
    school = Column(String(100))
    position_preference = Column(String(20))  # 선호 포지션 (참고용)
    height = Column(Integer)  # cm
    weight = Column(Integer)  # kg
    join_date = Column(Date)
    notes = Column(Text)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
