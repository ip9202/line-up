#!/usr/bin/env python3
"""
샘플 데이터 생성 스크립트
"""
from app.utils.database import SessionLocal
from app.models.team import Team
from app.models.venue import Venue
from app.models.player import Player
from app.models.game import Game
from datetime import datetime, timedelta

def create_sample_data():
    db = SessionLocal()
    
    try:
        # 1. 팀 데이터 생성
        teams = [
            Team(name='서홍돌아이스', city='서울', league='KBO'),
            Team(name='LG 트윈스', city='서울', league='KBO'),
            Team(name='두산 베어스', city='서울', league='KBO'),
            Team(name='키움 히어로즈', city='서울', league='KBO'),
        ]
        
        for team in teams:
            db.add(team)
        db.commit()
        print("✅ 팀 데이터 생성 완료")
        
        # 2. 경기장 데이터 생성
        venues = [
            Venue(name='공천포경기장', location='서울', capacity=25000, surface_type='잔디', is_indoor=False),
            Venue(name='잠실야구장', location='서울', capacity=25000, surface_type='잔디', is_indoor=False),
            Venue(name='고척스카이돔', location='서울', capacity=16000, surface_type='인조잔디', is_indoor=True),
            Venue(name='수원KT위즈파크', location='수원', capacity=20000, surface_type='잔디', is_indoor=False),
        ]
        
        for venue in venues:
            db.add(venue)
        db.commit()
        print("✅ 경기장 데이터 생성 완료")
        
        # 3. 선수 데이터 생성
        players = []
        positions = ['투수', '포수', '1루수', '2루수', '3루수', '유격수', '좌익수', '중견수', '우익수']
        
        for i in range(1, 26):  # 25명의 선수
            player = Player(
                name=f'선수{i:02d}',
                number=i,
                position_preference=positions[i % len(positions)],
                role='선수',
                is_professional=i <= 2,  # 처음 2명만 프로 출신
                birth_date=datetime(1990 + (i % 10), 1, 1),
                height=170 + (i % 20),
                weight=70 + (i % 20)
            )
            players.append(player)
            db.add(player)
        
        db.commit()
        print("✅ 선수 데이터 생성 완료 (25명)")
        
        # 4. 경기 데이터 생성
        games = [
            Game(
                game_date=datetime.now() + timedelta(days=1),
                opponent_team_id=1,  # 서홍돌아이스
                venue_id=1,  # 공천포경기장
                is_home=True,
                game_type='REGULAR',
                status='SCHEDULED'
            ),
            Game(
                game_date=datetime.now() + timedelta(days=3),
                opponent_team_id=2,  # LG 트윈스
                venue_id=2,  # 잠실야구장
                is_home=False,
                game_type='REGULAR',
                status='SCHEDULED'
            ),
            Game(
                game_date=datetime.now() + timedelta(days=7),
                opponent_team_id=3,  # 두산 베어스
                venue_id=3,  # 고척스카이돔
                is_home=True,
                game_type='REGULAR',
                status='SCHEDULED'
            ),
        ]
        
        for game in games:
            db.add(game)
        db.commit()
        print("✅ 경기 데이터 생성 완료 (3경기)")
        
        print("\n🎉 모든 샘플 데이터 생성 완료!")
        print("📋 생성된 데이터:")
        print(f"   - 팀: {len(teams)}개")
        print(f"   - 경기장: {len(venues)}개") 
        print(f"   - 선수: {len(players)}명")
        print(f"   - 경기: {len(games)}경기")
        
    except Exception as e:
        print(f"❌ 에러 발생: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()
