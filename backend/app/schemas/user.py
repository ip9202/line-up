from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
# from app.enums.user_role import UserRole  # 문자열로 변경

class UserBase(BaseModel):
    username: str
    role: str  # '총무' 또는 '감독'

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str
