from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from pydantic import BaseModel

from app.utils.database import get_db
from app.models.lineup import Lineup
from app.models.lineup_player import LineupPlayer
from app.schemas.lineup import LineupCreate, LineupUpdate, LineupResponse, LineupPlayerResponse, LineupPlayerCreate
from app.dependencies.auth import get_current_active_user, require_coach_role

# 출석 상태 스키마
class AttendanceUpdate(BaseModel):
    attendance: Dict[int, bool]  # player_id: is_present

router = APIRouter()

@router.get("/", response_model=List[LineupResponse])
async def get_lineups(
    skip: int = 0,
    limit: int = 20,
    game_id: int = None,
    db: Session = Depends(get_db)
):
    """라인업 목록 조회"""
    from app.models.game import Game
    from app.models.team import Team
    from app.models.venue import Venue
    
    query = db.query(Lineup)
    
    if game_id:
        query = query.filter(Lineup.game_id == game_id)
    
    lineups = query.offset(skip).limit(limit).all()
    
    # 각 라인업에 경기 정보 추가
    result = []
    for lineup in lineups:
        # 경기 정보 조회
        game = db.query(Game).filter(Game.id == lineup.game_id).first()
        if game:
            # 상대팀 정보 조회
            opponent_team = db.query(Team).filter(Team.id == game.opponent_team_id).first()
            # 경기장 정보 조회
            venue = db.query(Venue).filter(Venue.id == game.venue_id).first()
            
            # 경기 정보를 딕셔너리로 변환
            game_data = {
                "id": game.id,
                "game_date": game.game_date,
                "is_home": game.is_home,
                "game_type": game.game_type,
                "status": game.status,
                "opponent_team": {
                    "id": opponent_team.id,
                    "name": opponent_team.name
                } if opponent_team else None,
                "venue": {
                    "id": venue.id,
                    "name": venue.name,
                    "location": venue.location
                } if venue else None
            }
            
            # 라인업 객체에 경기 정보 추가
            lineup_dict = {
                "id": lineup.id,
                "game_id": lineup.game_id,
                "name": lineup.name,
                "is_default": lineup.is_default,
                "created_at": lineup.created_at,
                "updated_at": lineup.updated_at,
                "lineup_players": lineup.lineup_players,
                "game": game_data
            }
            result.append(lineup_dict)
        else:
            result.append(lineup)
    
    return result

@router.get("/{lineup_id}", response_model=LineupResponse)
async def get_lineup(lineup_id: int, db: Session = Depends(get_db)):
    """라인업 상세 조회"""
    from app.models.game import Game
    from app.models.team import Team
    from app.models.venue import Venue
    from app.models.player import Player
    from sqlalchemy.orm import joinedload
    
    # 선수 정보를 함께 로드
    lineup = db.query(Lineup).options(
        joinedload(Lineup.lineup_players).joinedload(LineupPlayer.player)
    ).filter(Lineup.id == lineup_id).first()
    
    if not lineup:
        raise HTTPException(status_code=404, detail="Lineup not found")
    
    # 라인업 플레이어들에 선수 정보 추가
    lineup_players_with_details = []
    for lineup_player in lineup.lineup_players:
        lineup_player_dict = {
            "id": lineup_player.id,
            "player_id": lineup_player.player_id,
            "position": lineup_player.position,
            "batting_order": lineup_player.batting_order,
            "is_starter": lineup_player.is_starter,
            "created_at": lineup_player.created_at,
            "player": {
                "id": lineup_player.player.id,
                "name": lineup_player.player.name,
                "number": lineup_player.player.number,
                "phone": lineup_player.player.phone,
                "email": lineup_player.player.email,
                "role": lineup_player.player.role,
                "age": lineup_player.player.age,
                "is_professional": lineup_player.player.is_professional,
                "is_active": lineup_player.player.is_active
            } if lineup_player.player else None
        }
        lineup_players_with_details.append(lineup_player_dict)
    
    # 경기 정보 조회
    game = db.query(Game).filter(Game.id == lineup.game_id).first()
    if game:
        # 상대팀 정보 조회
        opponent_team = db.query(Team).filter(Team.id == game.opponent_team_id).first()
        # 경기장 정보 조회
        venue = db.query(Venue).filter(Venue.id == game.venue_id).first()
        
        # 경기 정보를 딕셔너리로 변환
        game_data = {
            "id": game.id,
            "game_date": game.game_date,
            "is_home": game.is_home,
            "game_type": game.game_type,
            "status": game.status,
            "opponent_team": {
                "id": opponent_team.id,
                "name": opponent_team.name
            } if opponent_team else None,
            "venue": {
                "id": venue.id,
                "name": venue.name,
                "location": venue.location
            } if venue else None
        }
        
        # 라인업 객체에 경기 정보 추가
        lineup_dict = {
            "id": lineup.id,
            "game_id": lineup.game_id,
            "name": lineup.name,
            "is_default": lineup.is_default,
            "created_at": lineup.created_at,
            "updated_at": lineup.updated_at,
            "lineup_players": lineup_players_with_details,
            "game": game_data
        }
        return lineup_dict
    
    return lineup

@router.post("/", response_model=LineupResponse)
async def create_lineup(
    lineup: LineupCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(require_coach_role)
):
    """라인업 생성"""
    from app.models.game import Game
    from app.models.team import Team
    from app.models.venue import Venue
    
    db_lineup = Lineup(**lineup.dict())
    db.add(db_lineup)
    db.commit()
    db.refresh(db_lineup)
    
    # 경기 정보 조회
    game = db.query(Game).filter(Game.id == db_lineup.game_id).first()
    if game:
        # 상대팀 정보 조회
        opponent_team = db.query(Team).filter(Team.id == game.opponent_team_id).first()
        # 경기장 정보 조회
        venue = db.query(Venue).filter(Venue.id == game.venue_id).first()
        
        # 경기 정보를 딕셔너리로 변환
        game_data = {
            "id": game.id,
            "date": game.game_date,
            "venue": {
                "id": venue.id if venue else None,
                "name": venue.name if venue else None,
                "location": venue.location if venue else None
            } if venue else None,
            "opponent_team": {
                "id": opponent_team.id if opponent_team else None,
                "name": opponent_team.name if opponent_team else None
            } if opponent_team else None,
            "is_home": game.is_home
        }
        
        # 라인업을 딕셔너리로 변환하고 경기 정보 추가
        lineup_dict = {
            "id": db_lineup.id,
            "name": db_lineup.name,
            "game_id": db_lineup.game_id,
            "game": game_data,
            "created_at": db_lineup.created_at,
            "updated_at": db_lineup.updated_at
        }
        return lineup_dict
    
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
    
    # Check for player conflicts
    if 1 <= player_data.batting_order <= 9:
        # 같은 타순에 기존 선수들 확인
        existing_players = db.query(LineupPlayer).filter(
            LineupPlayer.lineup_id == lineup_id,
            LineupPlayer.batting_order == player_data.batting_order
        ).all()
        
        if existing_players:
            # 투수가 아닌 경우 (position이 NULL이거나 'P'가 아닌 경우): 기존 타자들을 모두 제거하고 새 타자 추가 (교체)
            if player_data.position != 'P':
                for existing_player in existing_players:
                    if existing_player.position != 'P':
                        db.delete(existing_player)
            else:
                # 투수인 경우: 기존 선수들과 중복 체크 없이 추가 (투수는 타자와 중복 가능)
                pass
        
        # 중복 체크: 같은 선수가 이미 라인업에 있는지 확인
        existing_player = db.query(LineupPlayer).filter(
            LineupPlayer.lineup_id == lineup_id,
            LineupPlayer.player_id == player_data.player_id
        ).first()
        
        if existing_player:
            # 투수와 타자는 서로 중복 가능
            if (existing_player.position == 'P' and player_data.position != 'P') or \
               (existing_player.position != 'P' and player_data.position == 'P'):
                # 투수 ↔ 타자 중복은 허용
                pass
            else:
                # 같은 타입(타자↔타자, 투수↔투수)은 중복 불가
                if player_data.position != 'P':
                    raise HTTPException(
                        status_code=400,
                        detail=f"해당 선수는 이미 타순 {existing_player.batting_order}번에 배정되어 있습니다. 타자는 중복 배정이 불가능합니다."
                    )
                else:
                    raise HTTPException(
                        status_code=400,
                        detail=f"해당 선수는 이미 투수로 배정되어 있습니다. 투수는 중복 배정이 불가능합니다."
                    )
    
    # Create lineup player
    player_data_dict = player_data.dict()
    # position이 빈 문자열이면 None으로 설정 (NULL로 저장)
    if player_data_dict.get('position') == '':
        player_data_dict['position'] = None
    
    lineup_player = LineupPlayer(
        lineup_id=lineup_id,
        **player_data_dict
    )
    db.add(lineup_player)
    db.commit()
    db.refresh(lineup_player)
    
    return lineup_player

@router.put("/{lineup_id}/players/{lineup_player_id}")
async def update_lineup_player_position(
    lineup_id: int,
    lineup_player_id: int,
    position_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(require_coach_role)
):
    """라인업 플레이어 포지션 업데이트"""
    lineup_player = db.query(LineupPlayer).filter(
        LineupPlayer.id == lineup_player_id,
        LineupPlayer.lineup_id == lineup_id
    ).first()
    
    if not lineup_player:
        raise HTTPException(status_code=404, detail="Lineup player not found")
    
    # 포지션 업데이트
    new_position = position_data.get('position')
    if new_position == '':
        new_position = None
    
    lineup_player.position = new_position
    db.commit()
    
    return {"message": "Player position updated successfully"}

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

@router.get("/{lineup_id}/attendance")
async def get_lineup_attendance(
    lineup_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """라인업의 출석 상태 조회"""
    try:
        lineup = db.query(Lineup).filter(Lineup.id == lineup_id).first()
        if not lineup:
            raise HTTPException(status_code=404, detail="Lineup not found")
        
        # 저장된 출석 상태 불러오기 (attendance_data 필드 사용)
        import json
        if lineup.attendance_data:
            try:
                attendance = json.loads(lineup.attendance_data)
                # JSON에서 불러온 값들을 boolean으로 변환
                attendance = {int(k): bool(v) for k, v in attendance.items()}
                return {"attendance": attendance}
            except (json.JSONDecodeError, ValueError):
                pass
        
        # 저장된 출석 상태가 없으면 빈 객체 반환
        return {"attendance": {}}
    except Exception as e:
        return {"attendance": {}}

@router.put("/{lineup_id}/attendance")
async def update_lineup_attendance(
    lineup_id: int,
    attendance_data: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_coach_role)
):
    """라인업의 출석 상태 업데이트"""
    lineup = db.query(Lineup).filter(Lineup.id == lineup_id).first()
    if not lineup:
        raise HTTPException(status_code=404, detail="Lineup not found")
    
    # 출석 상태를 JSON으로 저장 (attendance_data 필드 사용)
    import json
    attendance_json = json.dumps(attendance_data.attendance)
    lineup.attendance_data = attendance_json
    db.commit()
    
    return {"message": "Attendance updated successfully"}

@router.put("/{lineup_id}/players/{lineup_player_id}")
async def update_lineup_player_position(
    lineup_id: int,
    lineup_player_id: int,
    position_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(require_coach_role)
):
    """라인업 선수의 포지션 업데이트"""
    # 라인업 존재 확인
    lineup = db.query(Lineup).filter(Lineup.id == lineup_id).first()
    if not lineup:
        raise HTTPException(status_code=404, detail="Lineup not found")
    
    # 라인업 선수 존재 확인
    lineup_player = db.query(LineupPlayer).filter(
        LineupPlayer.id == lineup_player_id,
        LineupPlayer.lineup_id == lineup_id
    ).first()
    if not lineup_player:
        raise HTTPException(status_code=404, detail="Lineup player not found")
    
    # 포지션 중복 확인 (같은 포지션이 다른 선수에게 할당되어 있는지)
    if position_data.get('position') and position_data['position'] != '':
        existing_player = db.query(LineupPlayer).filter(
            LineupPlayer.lineup_id == lineup_id,
            LineupPlayer.position == position_data['position'],
            LineupPlayer.id != lineup_player_id
        ).first()
        
        if existing_player:
            raise HTTPException(
                status_code=400, 
                detail=f"포지션 {position_data['position']}은 이미 다른 선수에게 할당되어 있습니다."
            )
    
    # 포지션 업데이트
    lineup_player.position = position_data.get('position', '')
    db.commit()
    
    return {"message": "Position updated successfully"}
