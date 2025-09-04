from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class LineupPlayerBase(BaseModel):
    player_id: int
    position: Optional[str] = None
    batting_order: int
    is_starter: bool = True

class LineupPlayerCreate(LineupPlayerBase):
    pass

class PlayerInfo(BaseModel):
    id: int
    name: str
    number: Optional[int] = None
    phone: str
    email: Optional[str] = None
    role: str
    age: Optional[int] = None
    is_professional: bool
    is_active: bool

    class Config:
        from_attributes = True

class LineupPlayerResponse(LineupPlayerBase):
    id: int
    player: Optional[PlayerInfo] = None

    class Config:
        from_attributes = True

class LineupBase(BaseModel):
    game_id: int
    name: str
    is_default: bool = False

class LineupCreate(LineupBase):
    lineup_players: List[LineupPlayerCreate] = []

class LineupUpdate(BaseModel):
    name: Optional[str] = None
    is_default: Optional[bool] = None
    lineup_players: Optional[List[LineupPlayerCreate]] = None

class LineupResponse(LineupBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    lineup_players: List[LineupPlayerResponse] = []
    game: Optional[dict] = None  # 경기 정보 포함

    class Config:
        from_attributes = True
