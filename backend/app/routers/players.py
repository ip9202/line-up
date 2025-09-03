from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.utils.database import get_db
from app.models.player import Player
from app.schemas.player import PlayerCreate, PlayerUpdate, PlayerResponse
from app.dependencies.auth import get_current_active_user, require_manager_role

router = APIRouter()

@router.get("/", response_model=List[PlayerResponse])
async def get_players(
    skip: int = 0,
    limit: int = 20,
    active: bool = None,
    role: str = None,
    db: Session = Depends(get_db)
):
    """선수 목록 조회"""
    query = db.query(Player)
    
    if active is not None:
        query = query.filter(Player.is_active == active)
    
    if role:
        query = query.filter(Player.role == role)
    
    players = query.offset(skip).limit(limit).all()
    return players

@router.get("/{player_id}", response_model=PlayerResponse)
async def get_player(player_id: int, db: Session = Depends(get_db)):
    """선수 상세 조회"""
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player

@router.post("/", response_model=PlayerResponse)
async def create_player(
    player: PlayerCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(require_manager_role)
):
    """선수 등록"""
    try:
        db_player = Player(**player.model_dump())
        db.add(db_player)
        db.commit()
        db.refresh(db_player)
        return db_player
    except Exception as e:
        db.rollback()
        print(f"선수 생성 에러: {e}")
        raise HTTPException(status_code=400, detail=f"선수 생성 실패: {str(e)}")

@router.put("/{player_id}", response_model=PlayerResponse)
async def update_player(
    player_id: int, 
    player: PlayerUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(require_manager_role)
):
    """선수 수정"""
    try:
        db_player = db.query(Player).filter(Player.id == player_id).first()
        if not db_player:
            raise HTTPException(status_code=404, detail="Player not found")
        
        update_data = player.model_dump(exclude_unset=True)
        print(f"업데이트 데이터: {update_data}")
        
        for key, value in update_data.items():
            setattr(db_player, key, value)
        
        db.commit()
        db.refresh(db_player)
        return db_player
    except Exception as e:
        db.rollback()
        print(f"선수 수정 에러: {e}")
        raise HTTPException(status_code=400, detail=f"선수 수정 실패: {str(e)}")

@router.delete("/{player_id}")
async def delete_player(
    player_id: int, 
    db: Session = Depends(get_db)
):
    """선수 삭제"""
    print(f"선수 삭제 요청 - 선수 ID: {player_id}")
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    db.delete(player)
    db.commit()
    return {"message": "Player deleted successfully"}
