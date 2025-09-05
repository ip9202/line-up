from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.utils.database import get_db
from app.models.game import Game
from app.schemas.game import GameCreate, GameUpdate, GameResponse
from app.dependencies.auth import get_current_active_user, require_manager_role

router = APIRouter()

@router.get("/", response_model=List[GameResponse])
async def get_games(
    skip: int = 0,
    limit: int = 20,
    status: str = None,
    db: Session = Depends(get_db)
):
    """경기 목록 조회"""
    from app.models.team import Team
    
    query = db.query(Game)
    
    if status:
        query = query.filter(Game.status == status)
    
    games = query.offset(skip).limit(limit).all()
    
    # 각 경기에 팀 정보와 경기장 정보 포함
    from app.models.venue import Venue
    result = []
    for game in games:
        opponent_team = db.query(Team).filter(Team.id == game.opponent_team_id).first()
        venue = db.query(Venue).filter(Venue.id == game.venue_id).first()
        game_dict = {
            "id": game.id,
            "game_date": game.game_date,
            "venue_id": game.venue_id,
            "opponent_team_id": game.opponent_team_id,
            "is_home": game.is_home,
            "game_type": game.game_type,
            "status": game.status,
            "notes": game.notes,
            "created_at": game.created_at,
            "updated_at": game.updated_at,
            "opponent_team": {
                "id": opponent_team.id,
                "name": opponent_team.name,
                "city": opponent_team.city,
                "league": opponent_team.league
            } if opponent_team else None,
            "venue": {
                "id": venue.id,
                "name": venue.name,
                "location": venue.location,
                "capacity": venue.capacity,
                "surface_type": venue.surface_type,
                "is_indoor": venue.is_indoor
            } if venue else None
        }
        result.append(game_dict)
    
    return result

@router.get("/{game_id}", response_model=GameResponse)
async def get_game(game_id: int, db: Session = Depends(get_db)):
    """경기 상세 조회"""
    from app.models.team import Team
    
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    opponent_team = db.query(Team).filter(Team.id == game.opponent_team_id).first()
    from app.models.venue import Venue
    venue = db.query(Venue).filter(Venue.id == game.venue_id).first()
    
    return {
        "id": game.id,
        "game_date": game.game_date,
        "venue_id": game.venue_id,
        "opponent_team_id": game.opponent_team_id,
        "is_home": game.is_home,
        "game_type": game.game_type,
        "status": game.status,
        "notes": game.notes,
        "created_at": game.created_at,
        "updated_at": game.updated_at,
        "opponent_team": {
            "id": opponent_team.id,
            "name": opponent_team.name,
            "city": opponent_team.city,
            "league": opponent_team.league
        } if opponent_team else None,
        "venue": {
            "id": venue.id,
            "name": venue.name,
            "location": venue.location,
            "capacity": venue.capacity,
            "surface_type": venue.surface_type,
            "is_indoor": venue.is_indoor
        } if venue else None
    }

@router.post("/", response_model=GameResponse)
async def create_game(
    game: GameCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(require_manager_role)
):
    """경기 등록"""
    try:
        # 상대팀 존재 확인
        from app.models.team import Team
        from app.models.venue import Venue
        opponent_team = db.query(Team).filter(Team.id == game.opponent_team_id).first()
        if not opponent_team:
            raise HTTPException(status_code=400, detail="상대팀을 찾을 수 없습니다")
        
        # 경기장 존재 확인
        venue = db.query(Venue).filter(Venue.id == game.venue_id).first()
        if not venue:
            raise HTTPException(status_code=400, detail="경기장을 찾을 수 없습니다")
        
        db_game = Game(**game.model_dump())
        db.add(db_game)
        db.commit()
        db.refresh(db_game)
        
        # 팀 정보와 경기장 정보 포함하여 반환
        return GameResponse(
            id=db_game.id,
            game_date=db_game.game_date,
            venue_id=db_game.venue_id,
            opponent_team_id=db_game.opponent_team_id,
            is_home=db_game.is_home,
            game_type=db_game.game_type,
            status=db_game.status,
            notes=db_game.notes,
            created_at=db_game.created_at,
            updated_at=db_game.updated_at,
            opponent_team={
                "id": opponent_team.id,
                "name": opponent_team.name,
                "city": opponent_team.city,
                "league": opponent_team.league
            },
            venue={
                "id": venue.id,
                "name": venue.name,
                "location": venue.location,
                "capacity": venue.capacity,
                "surface_type": venue.surface_type,
                "is_indoor": venue.is_indoor
            }
        )
    except Exception as e:
        db.rollback()
        print(f"경기 생성 에러: {e}")
        raise HTTPException(status_code=400, detail=f"경기 생성 실패: {str(e)}")

@router.put("/{game_id}", response_model=GameResponse)
async def update_game(
    game_id: int, 
    game: GameUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(require_manager_role)
):
    """경기 수정"""
    db_game = db.query(Game).filter(Game.id == game_id).first()
    if not db_game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    for key, value in game.model_dump(exclude_unset=True).items():
        setattr(db_game, key, value)
    
    db.commit()
    db.refresh(db_game)
    return db_game

@router.delete("/{game_id}")
async def delete_game(
    game_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(require_manager_role)
):
    """경기 삭제"""
    from app.models.lineup import Lineup
    
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # 연결된 라인업이 있는지 확인
    existing_lineups = db.query(Lineup).filter(Lineup.game_id == game_id).count()
    if existing_lineups > 0:
        raise HTTPException(
            status_code=400, 
            detail="연결된 오더지가 있습니다. 먼저 오더지를 삭제해 주세요."
        )
    
    db.delete(game)
    db.commit()
    return {"message": "Game deleted successfully"}

@router.get("/{game_id}/lineups/count")
async def get_game_lineups_count(game_id: int, db: Session = Depends(get_db)):
    """경기의 라인업 개수 조회"""
    from app.models.lineup import Lineup
    
    game = db.query(Game).filter(Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")
    
    lineups_count = db.query(Lineup).filter(Lineup.game_id == game_id).count()
    
    return {"lineups_count": lineups_count}
