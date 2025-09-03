from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.utils.database import get_db
from app.models.user import User
from app.utils.auth import verify_token
# from app.enums.user_role import UserRole  # 문자열로 변경

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """현재 로그인한 사용자 정보 반환"""
    token = credentials.credentials
    username = verify_token(token)
    
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """활성 사용자만 허용"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def require_manager_role(current_user: User = Depends(get_current_active_user)) -> User:
    """총무 권한 필요"""
    if current_user.role != "총무":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manager role required"
        )
    return current_user

def require_coach_role(current_user: User = Depends(get_current_active_user)) -> User:
    """감독 권한 필요 (라인업 관리 전용)"""
    if current_user.role != "감독":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coach role required for lineup management"
        )
    return current_user

def require_coach_or_manager_role(current_user: User = Depends(get_current_active_user)) -> User:
    """감독 또는 총무 권한 필요 (일반 조회용)"""
    if current_user.role not in ["감독", "총무"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Coach or Manager role required"
        )
    return current_user
