from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from app.enums.player_role import PlayerRole

class PlayerBase(BaseModel):
    name: str
    number: Optional[int] = None
    phone: str
    email: Optional[EmailStr] = None
    photo_url: Optional[str] = None
    team_id: Optional[int] = None
    role: PlayerRole = PlayerRole.PLAYER
    age: Optional[int] = None
    birth_date: Optional[date] = None
    hometown: Optional[str] = None
    school: Optional[str] = None
    position_preference: Optional[str] = None
    height: Optional[int] = None
    weight: Optional[int] = None
    join_date: Optional[date] = None
    is_professional: bool = False
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
    team_id: Optional[int] = None
    role: Optional[PlayerRole] = None
    age: Optional[int] = None
    birth_date: Optional[date] = None
    hometown: Optional[str] = None
    school: Optional[str] = None
    position_preference: Optional[str] = None
    height: Optional[int] = None
    weight: Optional[int] = None
    join_date: Optional[date] = None
    is_professional: Optional[bool] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None

class PlayerResponse(PlayerBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
