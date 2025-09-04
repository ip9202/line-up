#!/usr/bin/env python3
"""
라인업 생성을 위한 더미 선수 데이터 생성 스크립트
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
from app.models.user import User
from sqlalchemy.orm import Session

# 더미 선수 데이터 (등번호 50번부터 시작)
DUMMY_PLAYERS = [
    # 투수들 (5명)
    {"name": "김투수", "number": 50, "phone": "010-1000-0001", "email": "pitcher1@example.com", "role": "선수", "age": 24, "hometown": "서울", "school": "서울고등학교", "position_preference": "P", "height": 185, "weight": 85, "is_professional": True, "notes": "에이스 투수"},
    {"name": "이투수", "number": 51, "phone": "010-1000-0011", "email": "pitcher2@example.com", "role": "선수", "age": 22, "hometown": "부산", "school": "부산고등학교", "position_preference": "P", "height": 180, "weight": 80, "is_professional": True, "notes": "좌완 투수"},
    {"name": "박투수", "number": 52, "phone": "010-1000-0021", "email": "pitcher3@example.com", "role": "선수", "age": 26, "hometown": "대구", "school": "대구고등학교", "position_preference": "P", "height": 190, "weight": 90, "is_professional": False, "notes": "마무리 투수"},
    {"name": "최투수", "number": 53, "phone": "010-1000-0031", "email": "pitcher4@example.com", "role": "선수", "age": 23, "hometown": "인천", "school": "인천고등학교", "position_preference": "P", "height": 175, "weight": 75, "is_professional": True, "notes": "중간계투"},
    {"name": "정투수", "number": 54, "phone": "010-1000-0041", "email": "pitcher5@example.com", "role": "선수", "age": 25, "hometown": "광주", "school": "광주고등학교", "position_preference": "P", "height": 182, "weight": 88, "is_professional": False, "notes": "선발 투수"},
    
    # 포수들 (2명)
    {"name": "김포수", "number": 55, "phone": "010-2000-0002", "email": "catcher1@example.com", "role": "선수", "age": 27, "hometown": "서울", "school": "서울대학교", "position_preference": "C", "height": 175, "weight": 85, "is_professional": True, "notes": "메인 포수"},
    {"name": "이포수", "number": 56, "phone": "010-2000-0012", "email": "catcher2@example.com", "role": "선수", "age": 24, "hometown": "대전", "school": "대전고등학교", "position_preference": "C", "height": 170, "weight": 80, "is_professional": False, "notes": "백업 포수"},
    
    # 1루수들 (2명)
    {"name": "김1루", "number": 57, "phone": "010-3000-0003", "email": "first1@example.com", "role": "선수", "age": 28, "hometown": "서울", "school": "고려대학교", "position_preference": "1B", "height": 190, "weight": 95, "is_professional": True, "notes": "강타자 1루수"},
    {"name": "이1루", "number": 58, "phone": "010-3000-0013", "email": "first2@example.com", "role": "선수", "age": 26, "hometown": "부산", "school": "부산대학교", "position_preference": "1B", "height": 185, "weight": 90, "is_professional": False, "notes": "백업 1루수"},
    
    # 2루수들 (2명)
    {"name": "김2루", "number": 59, "phone": "010-4000-0004", "email": "second1@example.com", "role": "선수", "age": 25, "hometown": "대구", "school": "영남대학교", "position_preference": "2B", "height": 175, "weight": 75, "is_professional": True, "notes": "빠른 2루수"},
    {"name": "이2루", "number": 60, "phone": "010-4000-0014", "email": "second2@example.com", "role": "선수", "age": 23, "hometown": "인천", "school": "인하대학교", "position_preference": "2B", "height": 170, "weight": 70, "is_professional": False, "notes": "백업 2루수"},
    
    # 3루수들 (2명)
    {"name": "김3루", "number": 61, "phone": "010-5000-0005", "email": "third1@example.com", "role": "선수", "age": 29, "hometown": "서울", "school": "연세대학교", "position_preference": "3B", "height": 180, "weight": 85, "is_professional": True, "notes": "파워 3루수"},
    {"name": "이3루", "number": 62, "phone": "010-5000-0015", "email": "third2@example.com", "role": "선수", "age": 24, "hometown": "부산", "school": "부산대학교", "position_preference": "3B", "height": 175, "weight": 80, "is_professional": False, "notes": "백업 3루수"},
    
    # 유격수들 (2명)
    {"name": "김유격", "number": 63, "phone": "010-6000-0006", "email": "short1@example.com", "role": "선수", "age": 26, "hometown": "대구", "school": "경북대학교", "position_preference": "SS", "height": 175, "weight": 75, "is_professional": True, "notes": "메인 유격수"},
    {"name": "이유격", "number": 64, "phone": "010-6000-0016", "email": "short2@example.com", "role": "선수", "age": 22, "hometown": "인천", "school": "인천대학교", "position_preference": "SS", "height": 170, "weight": 70, "is_professional": False, "notes": "백업 유격수"},
    
    # 좌익수들 (2명)
    {"name": "김좌익", "number": 65, "phone": "010-7000-0007", "email": "left1@example.com", "role": "선수", "age": 27, "hometown": "서울", "school": "서강대학교", "position_preference": "LF", "height": 180, "weight": 80, "is_professional": True, "notes": "강타자 좌익수"},
    {"name": "이좌익", "number": 66, "phone": "010-7000-0017", "email": "left2@example.com", "role": "선수", "age": 25, "hometown": "부산", "school": "동아대학교", "position_preference": "LF", "height": 175, "weight": 75, "is_professional": False, "notes": "백업 좌익수"},
    
    # 중견수들 (2명)
    {"name": "김중견", "number": 67, "phone": "010-8000-0008", "email": "center1@example.com", "role": "선수", "age": 24, "hometown": "대구", "school": "계명대학교", "position_preference": "CF", "height": 185, "weight": 85, "is_professional": True, "notes": "빠른 중견수"},
    {"name": "이중견", "number": 68, "phone": "010-8000-0018", "email": "center2@example.com", "role": "선수", "age": 23, "hometown": "인천", "school": "인하대학교", "position_preference": "CF", "height": 180, "weight": 80, "is_professional": False, "notes": "백업 중견수"},
    
    # 우익수들 (2명)
    {"name": "김우익", "number": 69, "phone": "010-9000-0009", "email": "right1@example.com", "role": "선수", "age": 28, "hometown": "서울", "school": "한양대학교", "position_preference": "RF", "height": 180, "weight": 85, "is_professional": True, "notes": "강타자 우익수"},
    {"name": "이우익", "number": 70, "phone": "010-9000-0019", "email": "right2@example.com", "role": "선수", "age": 26, "hometown": "부산", "school": "부산대학교", "position_preference": "RF", "height": 175, "weight": 80, "is_professional": False, "notes": "백업 우익수"},
    
    # 지명타자들 (2명)
    {"name": "김지명", "number": 71, "phone": "010-0000-0010", "email": "dh1@example.com", "role": "선수", "age": 30, "hometown": "대구", "school": "경북대학교", "position_preference": "DH", "height": 185, "weight": 95, "is_professional": True, "notes": "강타자 지명타자"},
    {"name": "이지명", "number": 72, "phone": "010-0000-0020", "email": "dh2@example.com", "role": "선수", "age": 27, "hometown": "인천", "school": "인천대학교", "position_preference": "DH", "height": 180, "weight": 90, "is_professional": False, "notes": "백업 지명타자"},
    
    # 유틸리티 선수들 (3명)
    {"name": "김유틸", "number": 73, "phone": "010-2200-0022", "email": "util1@example.com", "role": "선수", "age": 25, "hometown": "서울", "school": "서울대학교", "position_preference": "2B", "height": 175, "weight": 75, "is_professional": False, "notes": "다양한 포지션 가능"},
    {"name": "이유틸", "number": 74, "phone": "010-2300-0023", "email": "util2@example.com", "role": "선수", "age": 24, "hometown": "부산", "school": "부산대학교", "position_preference": "OF", "height": 180, "weight": 80, "is_professional": False, "notes": "외야 유틸리티"},
    {"name": "박유틸", "number": 75, "phone": "010-2400-0024", "email": "util3@example.com", "role": "선수", "age": 26, "hometown": "대구", "school": "영남대학교", "position_preference": "IF", "height": 175, "weight": 78, "is_professional": False, "notes": "내야 유틸리티"},
]

async def create_dummy_players():
    """더미 선수 데이터를 데이터베이스에 추가"""
    db = next(get_db())
    
    try:
        created_count = 0
        skipped_count = 0
        
        for player_data in DUMMY_PLAYERS:
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
                is_active=True,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            db.add(new_player)
            created_count += 1
            print(f"✅ 선수 '{player_data['name']}' (#{player_data['number']}) 추가됨 - {player_data['position_preference']}")
        
        # 변경사항 저장
        db.commit()
        
        print(f"\n🎉 더미 선수 데이터 생성 완료!")
        print(f"📊 새로 생성된 선수: {created_count}명")
        print(f"⏭️  건너뛴 선수: {skipped_count}명")
        print(f"📈 총 더미 선수: {len(DUMMY_PLAYERS)}명")
        
        # 포지션별 통계
        position_stats = {}
        for player_data in DUMMY_PLAYERS:
            pos = player_data["position_preference"]
            position_stats[pos] = position_stats.get(pos, 0) + 1
        
        print(f"\n📋 포지션별 선수 수:")
        for pos, count in sorted(position_stats.items()):
            print(f"   {pos}: {count}명")
            
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🏟️  라인업 생성을 위한 더미 선수 데이터 생성 시작...")
    asyncio.run(create_dummy_players())
