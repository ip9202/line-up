from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.utils.database import get_db
from app.models.game import Game
from app.schemas.game import GameCreate, GameUpdate, GameResponse

router = APIRouter()

@router.get("/", response_model=List[GameResponse])
async def get_games(
    skip: int = 0,
    limit: int = 20,
    status: str = None,
    db: Session = Depends(get_db)
):
    """경기 목록 조회"""
    query = db.query(Game)
    
    if status:
        query = query.filter(Game.status == status)
    
    games = query.offset(skip).limit(limit).all()
    return games

@router.get("/{game_id}", response_model=GameResponse)
async def get_game(game_id: int, db: Session = Depends(get_db)):
    """경기 상세 조회"""
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    return game

@router.post("/", response_model=GameResponse)
async def create_game(game: GameCreate, db: Session = Depends(get_db)):
    """경기 등록"""
    db_game = Game(**game.dict())
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    return db_game

@router.put("/{game_id}", response_model=GameResponse)
async def update_game(
    game_id: int, 
    game: GameUpdate, 
    db: Session = Depends(get_db)
):
    """경기 수정"""
    db_game = db.query(Game).filter(Game.id == game_id).first()
    if not db_game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    for key, value in game.dict(exclude_unset=True).items():
        setattr(db_game, key, value)
    
    db.commit()
    db.refresh(db_game)
    return db_game

@router.delete("/{game_id}")
async def delete_game(game_id: int, db: Session = Depends(get_db)):
    """경기 삭제"""
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    db.delete(game)
    db.commit()
    return {"message": "Game deleted successfully"}
