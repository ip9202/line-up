#!/usr/bin/env python3
"""
Railway 실서버에 씨밀레 팀 선수 데이터 생성 스크립트
"""

import requests
import json
from typing import List, Dict, Any

# Railway 실서버 API URL
RAILWAY_API_URL = "https://line-up-backend-production.up.railway.app/api/v1"

# 씨밀레 팀 선수 데이터
CIMILE_PLAYERS = [
    # 감독진 (3명)
    {"name": "김감독", "number": 1, "phone": "010-1000-0001", "email": "manager@cimile.com", "role": "감독", "age": 45, "hometown": "서울", "school": "서울대학교", "position_preference": "C", "height": 175, "weight": 80, "is_professional": True, "notes": "씨밀레 팀 감독"},
    {"name": "이코치", "number": 2, "phone": "010-1000-0002", "email": "coach@cimile.com", "role": "코치", "age": 38, "hometown": "부산", "school": "부산대학교", "position_preference": "P", "height": 180, "weight": 85, "is_professional": True, "notes": "씨밀레 팀 코치"},
    {"name": "박고문", "number": 3, "phone": "010-1000-0003", "email": "advisor@cimile.com", "role": "고문", "age": 52, "hometown": "대구", "school": "경북대학교", "position_preference": "1B", "height": 185, "weight": 90, "is_professional": True, "notes": "씨밀레 팀 고문"},
    
    # 투수들 (4명)
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

def get_auth_token():
    """로그인하여 인증 토큰 획득"""
    login_data = {
        "username": "manager",
        "password": "manager123"
    }
    
    response = requests.post(f"{RAILWAY_API_URL}/auth/token", data=login_data)
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"❌ 로그인 실패: {response.status_code} - {response.text}")
        return None

def get_team_id(team_name="씨밀레"):
    """팀 이름으로 팀 ID 조회"""
    response = requests.get(f"{RAILWAY_API_URL}/teams/")
    if response.status_code == 200:
        teams = response.json()
        for team in teams:
            if team["name"] == team_name:
                return team["id"]
    print(f"❌ '{team_name}' 팀을 찾을 수 없습니다.")
    return None

def create_player(player_data, token, team_id):
    """선수 생성"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 팀 ID 추가
    player_data["team_id"] = team_id
    
    response = requests.post(f"{RAILWAY_API_URL}/players/", json=player_data, headers=headers)
    return response

def main():
    print("🏟️  Railway 실서버에 씨밀레 팀 선수 데이터 생성 시작...")
    
    # 1. 로그인하여 토큰 획득
    print("🔐 로그인 중...")
    token = get_auth_token()
    if not token:
        return
    print("✅ 로그인 성공!")
    
    # 2. 씨밀레 팀 ID 조회
    print("🔍 씨밀레 팀 조회 중...")
    team_id = get_team_id("씨밀레")
    if not team_id:
        return
    print(f"✅ 씨밀레 팀 발견! (팀 ID: {team_id})")
    
    # 3. 선수들 생성
    print("👥 선수 데이터 생성 중...")
    created_count = 0
    failed_count = 0
    
    for player_data in CIMILE_PLAYERS:
        response = create_player(player_data, token, team_id)
        if response.status_code == 200:
            created_count += 1
            print(f"✅ 선수 '{player_data['name']}' (#{player_data['number']}) 생성됨 - {player_data['role']}")
        else:
            failed_count += 1
            print(f"❌ 선수 '{player_data['name']}' 생성 실패: {response.status_code} - {response.text}")
    
    print(f"\n🎉 씨밀레 팀 선수 데이터 생성 완료!")
    print(f"📊 성공: {created_count}명")
    print(f"❌ 실패: {failed_count}명")
    print(f"📈 총 시도: {len(CIMILE_PLAYERS)}명")

if __name__ == "__main__":
    main()
