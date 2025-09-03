from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.utils.database import Base

class Venue(Base):
    __tablename__ = "venues"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False, index=True)
    location = Column(String(200), nullable=True)  # 주소
    capacity = Column(Integer, nullable=True)  # 수용 인원
    surface_type = Column(String(50), nullable=True)  # 잔디, 인조잔디 등
    is_indoor = Column(Boolean, default=False)  # 실내/실외
    notes = Column(Text, nullable=True)  # 기타 메모
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
