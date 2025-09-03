from enum import Enum

class PlayerRole(str, Enum):
    """선수 역할 정의"""
    PLAYER = "선수"          # 기본 선수
    MANAGER = "감독"         # 감독
    COACH = "코치"           # 코치
    MANAGER_OFFICE = "총무"  # 총무
    PRESIDENT = "회장"       # 회장
    ADVISOR = "고문"         # 고문

# 롤 우선순위 (라인업에서 표시 순서)
ROLE_PRIORITY = {
    PlayerRole.MANAGER: 1,      # 감독
    PlayerRole.COACH: 2,        # 코치
    PlayerRole.PRESIDENT: 3,    # 회장
    PlayerRole.ADVISOR: 4,      # 고문
    PlayerRole.MANAGER_OFFICE: 5, # 총무
    PlayerRole.PLAYER: 6,       # 선수
}
