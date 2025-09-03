from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.utils.database import get_db
from app.models.lineup import Lineup
from app.models.lineup_player import LineupPlayer
from app.schemas.lineup import LineupCreate, LineupUpdate, LineupResponse, LineupPlayerResponse, LineupPlayerCreate
from app.dependencies.auth import get_current_active_user, require_coach_role

router = APIRouter()

@router.get("/", response_model=List[LineupResponse])
async def get_lineups(
    skip: int = 0,
    limit: int = 20,
    game_id: int = None,
    db: Session = Depends(get_db)
):
    """라인업 목록 조회"""
    query = db.query(Lineup)
    
    if game_id:
        query = query.filter(Lineup.game_id == game_id)
    
    lineups = query.offset(skip).limit(limit).all()
    return lineups

@router.get("/{lineup_id}", response_model=LineupResponse)
async def get_lineup(lineup_id: int, db: Session = Depends(get_db)):
    """라인업 상세 조회"""
    lineup = db.query(Lineup).filter(Lineup.id == lineup_id).first()
    if not lineup:
        raise HTTPException(status_code=404, detail="Lineup not found")
    return lineup

@router.post("/", response_model=LineupResponse)
async def create_lineup(
    lineup: LineupCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(require_coach_role)
):
    """라인업 생성"""
    db_lineup = Lineup(**lineup.dict())
    db.add(db_lineup)
    db.commit()
    db.refresh(db_lineup)
    return db_lineup

@router.put("/{lineup_id}", response_model=LineupResponse)
async def update_lineup(
    lineup_id: int, 
    lineup: LineupUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(require_coach_role)
):
    """라인업 수정"""
    db_lineup = db.query(Lineup).filter(Lineup.id == lineup_id).first()
    if not db_lineup:
        raise HTTPException(status_code=404, detail="Lineup not found")
    
    for key, value in lineup.dict(exclude_unset=True).items():
        setattr(db_lineup, key, value)
    
    db.commit()
    db.refresh(db_lineup)
    return db_lineup

@router.delete("/{lineup_id}")
async def delete_lineup(
    lineup_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(require_coach_role)
):
    """라인업 삭제"""
    lineup = db.query(Lineup).filter(Lineup.id == lineup_id).first()
    if not lineup:
        raise HTTPException(status_code=404, detail="Lineup not found")
    
    db.delete(lineup)
    db.commit()
    return {"message": "Lineup deleted successfully"}

@router.post("/{lineup_id}/players", response_model=LineupPlayerResponse)
async def add_player_to_lineup(
    lineup_id: int,
    player_data: LineupPlayerCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_coach_role)
):
    """라인업에 선수 추가"""
    # Check if lineup exists
    lineup = db.query(Lineup).filter(Lineup.id == lineup_id).first()
    if not lineup:
        raise HTTPException(status_code=404, detail="Lineup not found")
    
    # Check if player exists
    from app.models.player import Player
    player = db.query(Player).filter(Player.id == player_data.player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Create lineup player
    lineup_player = LineupPlayer(
        lineup_id=lineup_id,
        **player_data.dict()
    )
    db.add(lineup_player)
    db.commit()
    db.refresh(lineup_player)
    
    return lineup_player

@router.delete("/{lineup_id}/players/{lineup_player_id}")
async def remove_player_from_lineup(
    lineup_id: int,
    lineup_player_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_coach_role)
):
    """라인업에서 선수 제거"""
    lineup_player = db.query(LineupPlayer).filter(
        LineupPlayer.id == lineup_player_id,
        LineupPlayer.lineup_id == lineup_id
    ).first()
    
    if not lineup_player:
        raise HTTPException(status_code=404, detail="Lineup player not found")
    
    db.delete(lineup_player)
    db.commit()
    return {"message": "Player removed from lineup successfully"}

@router.post("/{lineup_id}/copy", response_model=LineupResponse)
async def copy_lineup(
    lineup_id: int,
    new_name: str,
    new_game_id: int = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_coach_role)
):
    """라인업 복사"""
    original_lineup = db.query(Lineup).filter(Lineup.id == lineup_id).first()
    if not original_lineup:
        raise HTTPException(status_code=404, detail="Lineup not found")
    
    # Create new lineup
    new_lineup = Lineup(
        game_id=new_game_id or original_lineup.game_id,
        name=new_name,
        is_default=False
    )
    db.add(new_lineup)
    db.commit()
    db.refresh(new_lineup)
    
    # Copy lineup players
    for lineup_player in original_lineup.lineup_players:
        new_lineup_player = LineupPlayer(
            lineup_id=new_lineup.id,
            player_id=lineup_player.player_id,
            position=lineup_player.position,
            batting_order=lineup_player.batting_order,
            is_starter=lineup_player.is_starter
        )
        db.add(new_lineup_player)
    
    db.commit()
    return new_lineup
