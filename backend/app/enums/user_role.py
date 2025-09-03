from enum import Enum

class UserRole(str, Enum):
    MANAGER = "총무"  # 모든 CUD 권한
    COACH = "감독"    # 라인업 CUD 권한만
