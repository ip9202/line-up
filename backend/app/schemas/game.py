from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class GameBase(BaseModel):
    game_date: datetime
    venue_id: int
    opponent_team_id: int
    is_home: bool = True
    game_type: str = "REGULAR"
    status: str = "SCHEDULED"
    notes: Optional[str] = None

class GameCreate(GameBase):
    pass

class GameUpdate(BaseModel):
    game_date: Optional[datetime] = None
    venue_id: Optional[int] = None
    opponent_team_id: Optional[int] = None
    is_home: Optional[bool] = None
    game_type: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class GameResponse(GameBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    opponent_team: Optional[dict] = None  # 팀 정보 포함
    venue: Optional[dict] = None  # 경기장 정보 포함

    class Config:
        from_attributes = True
