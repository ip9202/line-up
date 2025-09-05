from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.utils.database import get_db
from app.models.team import Team
from app.schemas.team import TeamCreate, TeamUpdate, TeamResponse
from app.dependencies.auth import get_current_active_user, require_manager_role

router = APIRouter()

@router.get("/", response_model=List[TeamResponse])
async def get_teams(
    skip: int = 0,
    limit: int = 20,
    active: bool = None,
    league: str = None,
    db: Session = Depends(get_db)
):
    """팀 목록 조회"""
    query = db.query(Team)
    
    if active is not None:
        query = query.filter(Team.is_active == active)
    
    if league:
        query = query.filter(Team.league == league)
    
    teams = query.offset(skip).limit(limit).all()
    return teams

@router.get("/{team_id}", response_model=TeamResponse)
async def get_team(team_id: int, db: Session = Depends(get_db)):
    """팀 상세 조회"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return team

@router.post("/", response_model=TeamResponse)
async def create_team(
    team: TeamCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(require_manager_role)
):
    """팀 등록"""
    try:
        # 중복 팀명 체크
        existing_team = db.query(Team).filter(Team.name == team.name).first()
        if existing_team:
            raise HTTPException(status_code=400, detail="팀명이 이미 존재합니다")
        
        db_team = Team(**team.model_dump())
        db.add(db_team)
        db.commit()
        db.refresh(db_team)
        return db_team
    except Exception as e:
        db.rollback()
        print(f"팀 생성 에러: {e}")
        raise HTTPException(status_code=400, detail=f"팀 생성 실패: {str(e)}")

@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: int, 
    team: TeamUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(require_manager_role)
):
    """팀 수정"""
    try:
        db_team = db.query(Team).filter(Team.id == team_id).first()
        if not db_team:
            raise HTTPException(status_code=404, detail="Team not found")
        
        # 팀명 변경 시 중복 체크
        if team.name and team.name != db_team.name:
            existing_team = db.query(Team).filter(Team.name == team.name).first()
            if existing_team:
                raise HTTPException(status_code=400, detail="팀명이 이미 존재합니다")
        
        # 업데이트할 필드만 적용
        update_data = team.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_team, key, value)
        
        db.commit()
        db.refresh(db_team)
        return db_team
    except Exception as e:
        db.rollback()
        print(f"팀 수정 에러: {e}")
        raise HTTPException(status_code=400, detail=f"팀 수정 실패: {str(e)}")

@router.delete("/{team_id}")
async def delete_team(
    team_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(require_manager_role)
):
    """팀 삭제"""
    from app.models.game import Game
    from app.models.player import Player
    
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # 1단계: 연결된 경기가 있는지 확인 (상대팀으로 참조되는 경기)
    existing_games = db.query(Game).filter(Game.opponent_team_id == team_id).count()
    if existing_games > 0:
        raise HTTPException(
            status_code=400, 
            detail="연결된 경기가 있습니다. 먼저 경기를 삭제해 주세요."
        )
    
    # 2단계: 연결된 선수가 있는지 확인
    existing_players = db.query(Player).filter(Player.team_id == team_id).count()
    if existing_players > 0:
        raise HTTPException(
            status_code=400, 
            detail="소속된 선수가 있습니다. 선수 관리에서 팀을 변경하거나 선수를 삭제해 주세요."
        )
    
    db.delete(team)
    db.commit()
    return {"message": "Team deleted successfully"}
