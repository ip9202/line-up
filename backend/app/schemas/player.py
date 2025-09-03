from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime

class PlayerBase(BaseModel):
    name: str
    number: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    photo_url: Optional[str] = None
    age: Optional[int] = None
    birth_date: Optional[date] = None
    hometown: Optional[str] = None
    school: Optional[str] = None
    position_preference: Optional[str] = None
    height: Optional[int] = None
    weight: Optional[int] = None
    join_date: Optional[date] = None
    notes: Optional[str] = None
    is_active: bool = True

class PlayerCreate(PlayerBase):
    pass

class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    number: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    photo_url: Optional[str] = None
    age: Optional[int] = None
    birth_date: Optional[date] = None
    hometown: Optional[str] = None
    school: Optional[str] = None
    position_preference: Optional[str] = None
    height: Optional[int] = None
    weight: Optional[int] = None
    join_date: Optional[date] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None

class PlayerResponse(PlayerBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
