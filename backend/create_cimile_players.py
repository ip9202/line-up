#!/usr/bin/env python3
"""
씨밀레 팀 선수 데이터 생성 스크립트
"""

import asyncio
import sys
import os
from datetime import datetime, date
from typing import List, Dict, Any

# 프로젝트 루트를 Python 경로에 추가
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.utils.database import get_db
from app.models.player import Player
from app.models.team import Team
from sqlalchemy.orm import Session

# 씨밀레 팀 선수 데이터 (감독1, 코치1, 고문1, 선수17명)
CIMILE_PLAYERS = [
    # 감독진 (3명)
    {"name": "김감독", "number": 1, "phone": "010-1000-0001", "email": "manager@cimile.com", "role": "감독", "age": 45, "hometown": "서울", "school": "서울대학교", "position_preference": "C", "height": 175, "weight": 80, "is_professional": True, "notes": "씨밀레 팀 감독"},
    {"name": "이코치", "number": 2, "phone": "010-1000-0002", "email": "coach@cimile.com", "role": "코치", "age": 38, "hometown": "부산", "school": "부산대학교", "position_preference": "P", "height": 180, "weight": 85, "is_professional": True, "notes": "씨밀레 팀 코치"},
    {"name": "박고문", "number": 3, "phone": "010-1000-0003", "email": "advisor@cimile.com", "role": "고문", "age": 52, "hometown": "대구", "school": "경북대학교", "position_preference": "1B", "height": 185, "weight": 90, "is_professional": True, "notes": "씨밀레 팀 고문"},
    
    # 투수들 (4명) - 선수출신/비선수출신 섞어서
    {"name": "최에이스", "number": 10, "phone": "010-2000-0010", "email": "ace@cimile.com", "role": "선수", "age": 28, "hometown": "서울", "school": "고려대학교", "position_preference": "P", "height": 185, "weight": 88, "is_professional": True, "notes": "씨밀레 에이스 투수"},
    {"name": "정마무리", "number": 11, "phone": "010-2000-0011", "email": "closer@cimile.com", "role": "선수", "age": 26, "hometown": "인천", "school": "인하대학교", "position_preference": "P", "height": 180, "weight": 82, "is_professional": False, "notes": "씨밀레 마무리 투수"},
    {"name": "강선발", "number": 12, "phone": "010-2000-0012", "email": "starter@cimile.com", "role": "선수", "age": 24, "hometown": "부산", "school": "부산대학교", "position_preference": "P", "height": 182, "weight": 85, "is_professional": True, "notes": "씨밀레 선발 투수"},
    {"name": "윤중계", "number": 13, "phone": "010-2000-0013", "email": "relief@cimile.com", "role": "선수", "age": 25, "hometown": "대전", "school": "충남대학교", "position_preference": "P", "height": 178, "weight": 80, "is_professional": False, "notes": "씨밀레 중간계투"},
    
    # 포수들 (2명)
    {"name": "한메인", "number": 20, "phone": "010-3000-0020", "email": "main_catcher@cimile.com", "role": "선수", "age": 29, "hometown": "서울", "school": "연세대학교", "position_preference": "C", "height": 175, "weight": 85, "is_professional": True, "notes": "씨밀레 메인 포수"},
    {"name": "서백업", "number": 21, "phone": "010-3000-0021", "email": "backup_catcher@cimile.com", "role": "선수", "age": 23, "hometown": "광주", "school": "전남대학교", "position_preference": "C", "height": 170, "weight": 78, "is_professional": False, "notes": "씨밀레 백업 포수"},
    
    # 내야수들 (6명)
    {"name": "조1루", "number": 30, "phone": "010-4000-0030", "email": "first_base@cimile.com", "role": "선수", "age": 27, "hometown": "대구", "school": "영남대학교", "position_preference": "1B", "height": 190, "weight": 95, "is_professional": True, "notes": "씨밀레 1루수"},
    {"name": "임2루", "number": 31, "phone": "010-4000-0031", "email": "second_base@cimile.com", "role": "선수", "age": 25, "hometown": "부산", "school": "동아대학교", "position_preference": "2B", "height": 175, "weight": 75, "is_professional": False, "notes": "씨밀레 2루수"},
    {"name": "오3루", "number": 32, "phone": "010-4000-0032", "email": "third_base@cimile.com", "role": "선수", "age": 26, "hometown": "서울", "school": "서강대학교", "position_preference": "3B", "height": 180, "weight": 85, "is_professional": True, "notes": "씨밀레 3루수"},
    {"name": "신유격", "number": 33, "phone": "010-4000-0033", "email": "shortstop@cimile.com", "role": "선수", "age": 24, "hometown": "인천", "school": "인천대학교", "position_preference": "SS", "height": 175, "weight": 75, "is_professional": False, "notes": "씨밀레 유격수"},
    {"name": "배유틸1", "number": 34, "phone": "010-4000-0034", "email": "util1@cimile.com", "role": "선수", "age": 23, "hometown": "대전", "school": "충남대학교", "position_preference": "2B", "height": 178, "weight": 80, "is_professional": False, "notes": "씨밀레 내야 유틸리티"},
    {"name": "홍유틸2", "number": 35, "phone": "010-4000-0035", "email": "util2@cimile.com", "role": "선수", "age": 22, "hometown": "광주", "school": "전북대학교", "position_preference": "3B", "height": 182, "weight": 85, "is_professional": True, "notes": "씨밀레 내야 유틸리티"},
    
    # 외야수들 (5명)
    {"name": "문좌익", "number": 40, "phone": "010-5000-0040", "email": "left_field@cimile.com", "role": "선수", "age": 28, "hometown": "서울", "school": "한양대학교", "position_preference": "LF", "height": 180, "weight": 80, "is_professional": True, "notes": "씨밀레 좌익수"},
    {"name": "송중견", "number": 41, "phone": "010-5000-0041", "email": "center_field@cimile.com", "role": "선수", "age": 26, "hometown": "부산", "school": "부산대학교", "position_preference": "CF", "height": 185, "weight": 85, "is_professional": False, "notes": "씨밀레 중견수"},
    {"name": "권우익", "number": 42, "phone": "010-5000-0042", "email": "right_field@cimile.com", "role": "선수", "age": 25, "hometown": "대구", "school": "계명대학교", "position_preference": "RF", "height": 180, "weight": 82, "is_professional": True, "notes": "씨밀레 우익수"},
    {"name": "안외야1", "number": 43, "phone": "010-5000-0043", "email": "outfield1@cimile.com", "role": "선수", "age": 24, "hometown": "인천", "school": "인하대학교", "position_preference": "OF", "height": 175, "weight": 78, "is_professional": False, "notes": "씨밀레 외야 유틸리티"},
    {"name": "전외야2", "number": 44, "phone": "010-5000-0044", "email": "outfield2@cimile.com", "role": "선수", "age": 23, "hometown": "대전", "school": "충남대학교", "position_preference": "OF", "height": 178, "weight": 80, "is_professional": True, "notes": "씨밀레 외야 유틸리티"},
]

async def create_cimile_players():
    """씨밀레 팀 선수 데이터를 데이터베이스에 추가"""
    db = next(get_db())
    
    try:
        # 씨밀레 팀 찾기
        cimile_team = db.query(Team).filter(Team.name == "씨밀레").first()
        if not cimile_team:
            print("❌ 씨밀레 팀을 찾을 수 없습니다. 먼저 팀을 생성해주세요.")
            return
        
        print(f"🏟️  씨밀레 팀 선수 데이터 생성 시작... (팀 ID: {cimile_team.id})")
        
        created_count = 0
        skipped_count = 0
        
        for player_data in CIMILE_PLAYERS:
            # 이미 존재하는 선수인지 확인 (이름과 등번호로)
            existing_player = db.query(Player).filter(
                Player.name == player_data["name"],
                Player.number == player_data["number"]
            ).first()
            
            if existing_player:
                print(f"⏭️  선수 '{player_data['name']}' (#{player_data['number']}) 이미 존재 - 건너뜀")
                skipped_count += 1
                continue
            
            # 새 선수 생성
            new_player = Player(
                name=player_data["name"],
                number=player_data["number"],
                phone=player_data["phone"],
                email=player_data["email"],
                role=player_data["role"],
                age=player_data["age"],
                hometown=player_data["hometown"],
                school=player_data["school"],
                position_preference=player_data["position_preference"],
                height=player_data["height"],
                weight=player_data["weight"],
                is_professional=player_data["is_professional"],
                notes=player_data["notes"],
                team_id=cimile_team.id,  # 씨밀레 팀에 속하도록 설정
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            db.add(new_player)
            created_count += 1
            print(f"✅ 선수 '{player_data['name']}' (#{player_data['number']}) 추가됨 - {player_data['role']} ({player_data['position_preference']})")
        
        # 변경사항 저장
        db.commit()
        
        print(f"\n🎉 씨밀레 팀 선수 데이터 생성 완료!")
        print(f"📊 새로 생성된 선수: {created_count}명")
        print(f"⏭️  건너뛴 선수: {skipped_count}명")
        print(f"📈 총 씨밀레 선수: {len(CIMILE_PLAYERS)}명")
        
        # 역할별 통계
        role_stats = {}
        for player_data in CIMILE_PLAYERS:
            role = player_data["role"]
            role_stats[role] = role_stats.get(role, 0) + 1
        
        print(f"\n📋 역할별 선수 수:")
        for role, count in sorted(role_stats.items()):
            print(f"   {role}: {count}명")
        
        # 선수출신/비선수출신 통계
        pro_stats = {"선수출신": 0, "비선수출신": 0}
        for player_data in CIMILE_PLAYERS:
            if player_data["is_professional"]:
                pro_stats["선수출신"] += 1
            else:
                pro_stats["비선수출신"] += 1
        
        print(f"\n🏆 출신별 선수 수:")
        for pro_type, count in pro_stats.items():
            print(f"   {pro_type}: {count}명")
            
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🏟️  씨밀레 팀 선수 데이터 생성 시작...")
    asyncio.run(create_cimile_players())
