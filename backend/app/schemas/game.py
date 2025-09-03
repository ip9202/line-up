from pydantic import BaseModel
from typing import Optional, List
from datetime import date, time, datetime

class GameBase(BaseModel):
    date: date
    time: time
    venue: str
    opponent: str
    game_type: str = "REGULAR"
    status: str = "SCHEDULED"
    notes: Optional[str] = None

class GameCreate(GameBase):
    pass

class GameUpdate(BaseModel):
    date: Optional[date] = None
    time: Optional[time] = None
    venue: Optional[str] = None
    opponent: Optional[str] = None
    game_type: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class GameResponse(GameBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
