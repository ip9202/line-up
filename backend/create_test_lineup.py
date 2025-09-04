#!/usr/bin/env python3
"""
테스트용 경기와 라인업 생성 스크립트
"""

import asyncio
import sys
import os
from datetime import datetime, date, timedelta

# 프로젝트 루트를 Python 경로에 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.database import get_db
from app.models.game import Game
from app.models.lineup import Lineup
from app.models.lineup_player import LineupPlayer
from app.models.player import Player
from sqlalchemy.orm import Session

async def create_test_lineup():
    """테스트용 경기와 라인업 생성"""
    db = next(get_db())
    
    try:
        # 1. 테스트 경기 생성
        test_game = Game(
            game_date=datetime.combine(date.today() + timedelta(days=7), datetime.min.time()),
            venue_id=1,  # 임시로 1번 경기장 사용
            opponent_team_id=1,  # 임시로 1번 팀 사용
            is_home=True,
            game_type="REGULAR",
            status="SCHEDULED",
            notes="테스트 경기",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(test_game)
        db.flush()  # ID를 얻기 위해 flush
        
        print(f"✅ 테스트 경기 생성: 상대팀 vs 우리팀 ({test_game.game_date.date()})")
        
        # 2. 테스트 라인업 생성
        test_lineup = Lineup(
            name="테스트 라인업",
            game_id=test_game.id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(test_lineup)
        db.flush()  # ID를 얻기 위해 flush
        
        print(f"✅ 테스트 라인업 생성: {test_lineup.name}")
        
        # 3. 선수 목록 가져오기 (등번호 50번 이상의 더미 선수들)
        players = db.query(Player).filter(Player.number >= 50).all()
        
        if len(players) < 10:
            print(f"❌ 선수가 부족합니다. 최소 10명 필요, 현재 {len(players)}명")
            return
        
        # 4. 기본 라인업 구성 (투수 1명 + 타자 9명)
        lineup_players = []
        
        # 투수 (등번호 50번)
        pitcher = next((p for p in players if p.number == 50), None)
        if pitcher:
            lineup_players.append(LineupPlayer(
                lineup_id=test_lineup.id,
                player_id=pitcher.id,
                position='P',
                batting_order=0,  # 투수는 타순 0
                is_starter=True,
                created_at=datetime.utcnow()
            ))
            print(f"✅ 투수 배치: {pitcher.name} (#{pitcher.number})")
        
        # 타자 9명 (등번호 55-63번)
        batting_orders = [55, 56, 57, 58, 59, 60, 61, 62, 63]  # 포수부터 유격수까지
        positions = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH']
        
        for i, (player_num, position) in enumerate(zip(batting_orders, positions)):
            player = next((p for p in players if p.number == player_num), None)
            if player:
                lineup_players.append(LineupPlayer(
                    lineup_id=test_lineup.id,
                    player_id=player.id,
                    position=position,
                    batting_order=i + 1,  # 1번부터 9번까지
                    is_starter=True,
                    created_at=datetime.utcnow()
                ))
                print(f"✅ {i+1}번 타자 배치: {player.name} (#{player.number}) - {position}")
        
        # 라인업 선수들 추가
        for lp in lineup_players:
            db.add(lp)
        
        # 변경사항 저장
        db.commit()
        
        print(f"\n🎉 테스트 라인업 생성 완료!")
        print(f"📊 경기: 상대팀 vs 우리팀")
        print(f"📅 날짜: {test_game.game_date.date()}")
        print(f"🏟️  장소: 경기장 ID {test_game.venue_id}")
        print(f"📋 라인업: {test_lineup.name}")
        print(f"👥 선수 수: {len(lineup_players)}명 (투수 1명 + 타자 9명)")
        
        print(f"\n📋 라인업 구성:")
        print(f"   투수: {pitcher.name if pitcher else '없음'}")
        for i, lp in enumerate(lineup_players[1:], 1):
            player = next((p for p in players if p.id == lp.player_id), None)
            if player:
                print(f"   {i}번 {lp.position}: {player.name} (#{player.number})")
        
        print(f"\n🔗 라인업 ID: {test_lineup.id}")
        print(f"🔗 경기 ID: {test_game.id}")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🏟️  테스트용 경기와 라인업 생성 시작...")
    asyncio.run(create_test_lineup())
