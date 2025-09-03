from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class LineupPlayerBase(BaseModel):
    player_id: int
    position: str
    batting_order: int
    is_starter: bool = True

class LineupPlayerCreate(LineupPlayerBase):
    pass

class LineupPlayerResponse(LineupPlayerBase):
    id: int

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

    class Config:
        from_attributes = True
