"""
PDF 생성 API 라우터
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Dict, Any
import os
import tempfile
from datetime import datetime

from app.utils.database import get_db
from app.services.pdf_service import pdf_service
from app.models.lineup import Lineup
from app.models.game import Game
from app.models.player import Player

router = APIRouter(tags=["PDF"])


@router.get("/lineup/{lineup_id}")
async def generate_lineup_pdf(
    lineup_id: int,
    db: Session = Depends(get_db)
):
    """
    라인업 PDF 생성 및 다운로드
    """
    try:
        # 라인업 데이터 조회
        lineup = db.query(Lineup).filter(Lineup.id == lineup_id).first()
        if not lineup:
            raise HTTPException(status_code=404, detail="라인업을 찾을 수 없습니다")
        
        # 경기 정보 조회
        game = db.query(Game).filter(Game.id == lineup.game_id).first()
        
        # 라인업 플레이어 정보 조회
        lineup_players = []
        for lp in lineup.lineup_players:
            player = db.query(Player).filter(Player.id == lp.player_id).first()
            if player:
                lineup_players.append({
                    'batting_order': lp.batting_order,
                    'position': lp.position,
                    'is_starter': lp.is_starter,
                    'player': {
                        'id': player.id,
                        'name': player.name,
                        'number': player.number,
                        'role': player.role.value if player.role else '선수',
                        'age': player.age,
                        'position_preference': player.position_preference
                    }
                })
        
        # PDF 생성용 데이터 구성
        pdf_data = {
            'id': lineup.id,
            'name': lineup.name,
            'game': {
                'opponent': game.opponent if game else '상대팀',
                'date': game.date.strftime('%Y-%m-%d') if game and game.date else '날짜미정',
                'venue': game.venue if game else '장소미정'
            } if game else None,
            'lineup_players': lineup_players
        }
        
        # 임시 파일 생성
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            pdf_path = tmp_file.name
        
        # PDF 생성
        pdf_service.create_lineup_pdf(pdf_data, pdf_path)
        
        # 파일명 생성
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"lineup_{lineup_id}_{timestamp}.pdf"
        
        return FileResponse(
            path=pdf_path,
            filename=filename,
            media_type='application/pdf',
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF 생성 중 오류가 발생했습니다: {str(e)}")


@router.get("/lineup/{lineup_id}/preview")
async def preview_lineup_pdf(
    lineup_id: int,
    db: Session = Depends(get_db)
):
    """
    라인업 PDF 미리보기 (브라우저에서 표시)
    """
    try:
        # 라인업 데이터 조회
        lineup = db.query(Lineup).filter(Lineup.id == lineup_id).first()
        if not lineup:
            raise HTTPException(status_code=404, detail="라인업을 찾을 수 없습니다")
        
        # 경기 정보 조회
        game = db.query(Game).filter(Game.id == lineup.game_id).first()
        
        # 라인업 플레이어 정보 조회
        lineup_players = []
        for lp in lineup.lineup_players:
            player = db.query(Player).filter(Player.id == lp.player_id).first()
            if player:
                lineup_players.append({
                    'batting_order': lp.batting_order,
                    'position': lp.position,
                    'is_starter': lp.is_starter,
                    'player': {
                        'id': player.id,
                        'name': player.name,
                        'number': player.number,
                        'role': player.role.value if player.role else '선수',
                        'age': player.age,
                        'position_preference': player.position_preference
                    }
                })
        
        # PDF 생성용 데이터 구성
        pdf_data = {
            'id': lineup.id,
            'name': lineup.name,
            'game': {
                'opponent': game.opponent if game else '상대팀',
                'date': game.date.strftime('%Y-%m-%d') if game and game.date else '날짜미정',
                'venue': game.venue if game else '장소미정'
            } if game else None,
            'lineup_players': lineup_players
        }
        
        # 임시 파일 생성
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            pdf_path = tmp_file.name
        
        # PDF 생성
        pdf_service.create_lineup_pdf(pdf_data, pdf_path)
        
        return FileResponse(
            path=pdf_path,
            media_type='application/pdf',
            headers={"Content-Disposition": "inline"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF 생성 중 오류가 발생했습니다: {str(e)}")