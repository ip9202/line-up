from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.utils.database import get_db
from app.models.venue import Venue
from app.schemas.venue import VenueCreate, VenueUpdate, VenueResponse
from app.dependencies.auth import require_manager_role

router = APIRouter()

@router.get("/", response_model=List[VenueResponse])
async def get_venues(
    skip: int = 0,
    limit: int = 100,
    active: bool = None,
    db: Session = Depends(get_db)
):
    """경기장 목록 조회"""
    query = db.query(Venue)
    
    if active is not None:
        query = query.filter(Venue.is_active == active)
    
    venues = query.offset(skip).limit(limit).all()
    return venues

@router.get("/{venue_id}", response_model=VenueResponse)
async def get_venue(venue_id: int, db: Session = Depends(get_db)):
    """경기장 상세 조회"""
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return venue

@router.post("/", response_model=VenueResponse)
async def create_venue(
    venue: VenueCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(require_manager_role)
):
    """경기장 등록"""
    try:
        # 이름 중복 확인
        existing_venue = db.query(Venue).filter(Venue.name == venue.name).first()
        if existing_venue:
            raise HTTPException(status_code=400, detail="이미 존재하는 경기장명입니다")
        
        db_venue = Venue(**venue.model_dump())
        db.add(db_venue)
        db.commit()
        db.refresh(db_venue)
        return db_venue
    except Exception as e:
        db.rollback()
        print(f"경기장 생성 에러: {e}")
        raise HTTPException(status_code=400, detail=f"경기장 생성 실패: {str(e)}")

@router.put("/{venue_id}", response_model=VenueResponse)
async def update_venue(
    venue_id: int, 
    venue: VenueUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(require_manager_role)
):
    """경기장 수정"""
    db_venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not db_venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    
    # 이름 중복 확인 (자기 자신 제외)
    if venue.name and venue.name != db_venue.name:
        existing_venue = db.query(Venue).filter(Venue.name == venue.name).first()
        if existing_venue:
            raise HTTPException(status_code=400, detail="이미 존재하는 경기장명입니다")
    
    for key, value in venue.model_dump(exclude_unset=True).items():
        setattr(db_venue, key, value)
    
    db.commit()
    db.refresh(db_venue)
    return db_venue

@router.delete("/{venue_id}")
async def delete_venue(
    venue_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(require_manager_role)
):
    """경기장 삭제"""
    venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    
    # 경기에서 사용 중인지 확인
    from app.models.game import Game
    games_using_venue = db.query(Game).filter(Game.venue_id == venue_id).count()
    if games_using_venue > 0:
        raise HTTPException(status_code=400, detail=f"이 경기장을 사용하는 경기가 {games_using_venue}개 있습니다. 먼저 해당 경기들을 수정하거나 삭제해주세요.")
    
    db.delete(venue)
    db.commit()
    return {"message": "Venue deleted successfully"}
