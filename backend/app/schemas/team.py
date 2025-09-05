from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TeamBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="팀명")
    city: Optional[str] = Field(None, max_length=50, description="도시명")
    league: Optional[str] = Field(None, max_length=50, description="리그명")
    is_active: bool = Field(True, description="활성 상태")
    is_our_team: bool = Field(False, description="우리팀 여부")

class TeamCreate(TeamBase):
    pass

class TeamUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    city: Optional[str] = Field(None, max_length=50)
    league: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None
    is_our_team: Optional[bool] = None

class TeamResponse(TeamBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
