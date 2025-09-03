from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VenueBase(BaseModel):
    name: str
    location: Optional[str] = None
    capacity: Optional[int] = None
    surface_type: Optional[str] = None
    is_indoor: Optional[bool] = False
    notes: Optional[str] = None
    is_active: Optional[bool] = True

class VenueCreate(VenueBase):
    pass

class VenueUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    capacity: Optional[int] = None
    surface_type: Optional[str] = None
    is_indoor: Optional[bool] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None

class VenueResponse(VenueBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
