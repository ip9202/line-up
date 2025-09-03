# 🔌 API 설계 문서

## 📋 API 개요

### 기본 정보
- **Base URL**: `http://localhost:8000` (개발), `https://your-domain.railway.app` (프로덕션)
- **API 버전**: v1
- **인증**: JWT Token (선택사항)
- **응답 형식**: JSON
- **에러 처리**: HTTP 상태 코드 + JSON 에러 메시지

### 공통 응답 형식
```json
{
  "success": true,
  "data": {},
  "message": "Success",
  "timestamp": "2024-12-19T10:30:00Z"
}
```

### 에러 응답 형식
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {}
  },
  "timestamp": "2024-12-19T10:30:00Z"
}
```

## 🏟️ 선수 관리 API

### 1. 선수 목록 조회
```http
GET /api/v1/players
```

**Query Parameters:**
- `active` (optional): 활성 상태 필터 (true/false)
- `position_preference` (optional): 선호 포지션 필터 (P, C, 1B, 2B, 3B, SS, LF, CF, RF, DH)
- `hometown` (optional): 출신지 필터
- `school` (optional): 학교 필터
- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 항목 수 (기본값: 20)

**응답:**
```json
{
  "success": true,
  "data": {
    "players": [
      {
        "id": 1,
        "name": "김철수",
        "number": 18,
        "phone": "010-1234-5678",
        "email": "kim@example.com",
        "photo_url": "https://example.com/photo1.jpg",
        "age": 25,
        "birth_date": "1999-03-15",
        "hometown": "서울",
        "school": "고려대학교",
        "position_preference": "P",
        "height": 185,
        "weight": 80,
        "join_date": "2024-01-01",
        "notes": "좌완 투수",
        "is_active": true,
        "created_at": "2024-12-19T10:30:00Z",
        "updated_at": "2024-12-19T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "pages": 2
    }
  }
}
```

### 2. 선수 상세 조회
```http
GET /api/v1/players/{player_id}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "김철수",
    "position": "P",
    "number": 18,
    "phone": "010-1234-5678",
    "email": "kim@example.com",
    "photo_url": "https://example.com/photo1.jpg",
    "is_active": true,
    "created_at": "2024-12-19T10:30:00Z",
    "updated_at": "2024-12-19T10:30:00Z"
  }
}
```

### 3. 선수 등록
```http
POST /api/v1/players
```

**요청 Body:**
```json
{
  "name": "김철수",
  "number": 18,
  "phone": "010-1234-5678",
  "email": "kim@example.com",
  "photo_url": "https://example.com/photo1.jpg",
  "age": 25,
  "birth_date": "1999-03-15",
  "hometown": "서울",
  "school": "고려대학교",
  "position_preference": "P",
  "height": 185,
  "weight": 80,
  "join_date": "2024-01-01",
  "notes": "좌완 투수"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "김철수",
    "position": "P",
    "number": 18,
    "phone": "010-1234-5678",
    "email": "kim@example.com",
    "photo_url": "https://example.com/photo1.jpg",
    "is_active": true,
    "created_at": "2024-12-19T10:30:00Z",
    "updated_at": "2024-12-19T10:30:00Z"
  }
}
```

### 4. 선수 수정
```http
PUT /api/v1/players/{player_id}
```

**요청 Body:**
```json
{
  "name": "김철수",
  "position": "P",
  "number": 18,
  "phone": "010-1234-5678",
  "email": "kim@example.com",
  "photo_url": "https://example.com/photo1.jpg",
  "is_active": true
}
```

### 5. 선수 삭제
```http
DELETE /api/v1/players/{player_id}
```

**응답:**
```json
{
  "success": true,
  "message": "Player deleted successfully"
}
```

## ⚾ 경기 관리 API

### 1. 경기 목록 조회
```http
GET /api/v1/games
```

**Query Parameters:**
- `status` (optional): 경기 상태 필터 (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)
- `date_from` (optional): 시작 날짜 (YYYY-MM-DD)
- `date_to` (optional): 종료 날짜 (YYYY-MM-DD)
- `page` (optional): 페이지 번호
- `limit` (optional): 페이지당 항목 수

**응답:**
```json
{
  "success": true,
  "data": {
    "games": [
      {
        "id": 1,
        "date": "2024-12-25",
        "time": "14:00:00",
        "venue": "잠실야구장",
        "opponent": "LG 트윈스",
        "game_type": "REGULAR",
        "status": "SCHEDULED",
        "notes": "홈 경기",
        "created_at": "2024-12-19T10:30:00Z",
        "updated_at": "2024-12-19T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "pages": 1
    }
  }
}
```

### 2. 경기 상세 조회
```http
GET /api/v1/games/{game_id}
```

### 3. 경기 등록
```http
POST /api/v1/games
```

**요청 Body:**
```json
{
  "date": "2024-12-25",
  "time": "14:00:00",
  "venue": "잠실야구장",
  "opponent": "LG 트윈스",
  "game_type": "REGULAR",
  "notes": "홈 경기"
}
```

### 4. 경기 수정
```http
PUT /api/v1/games/{game_id}
```

### 5. 경기 삭제
```http
DELETE /api/v1/games/{game_id}
```

## 📋 라인업 관리 API

### 1. 라인업 목록 조회
```http
GET /api/v1/lineups
```

**Query Parameters:**
- `game_id` (optional): 특정 경기의 라인업만 조회
- `page` (optional): 페이지 번호
- `limit` (optional): 페이지당 항목 수

**응답:**
```json
{
  "success": true,
  "data": {
    "lineups": [
      {
        "id": 1,
        "game_id": 1,
        "name": "12월 25일 라인업",
        "is_default": true,
        "created_at": "2024-12-19T10:30:00Z",
        "updated_at": "2024-12-19T10:30:00Z",
        "game": {
          "id": 1,
          "date": "2024-12-25",
          "time": "14:00:00",
          "venue": "잠실야구장",
          "opponent": "LG 트윈스"
        }
      }
    ]
  }
}
```

### 2. 라인업 상세 조회
```http
GET /api/v1/lineups/{lineup_id}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "game_id": 1,
    "name": "12월 25일 라인업",
    "is_default": true,
    "created_at": "2024-12-19T10:30:00Z",
    "updated_at": "2024-12-19T10:30:00Z",
    "game": {
      "id": 1,
      "date": "2024-12-25",
      "time": "14:00:00",
      "venue": "잠실야구장",
      "opponent": "LG 트윈스"
    },
    "lineup_players": [
      {
        "id": 1,
        "batting_order": 1,
        "position": "CF",
        "is_starter": true,
        "player": {
          "id": 1,
          "name": "김철수",
          "number": 18,
          "position": "P"
        }
      }
    ]
  }
}
```

### 3. 라인업 생성
```http
POST /api/v1/lineups
```

**요청 Body:**
```json
{
  "game_id": 1,
  "name": "12월 25일 라인업",
  "lineup_players": [
    {
      "player_id": 1,
      "position": "CF",
      "batting_order": 1,
      "is_starter": true
    },
    {
      "player_id": 2,
      "position": "SS",
      "batting_order": 2,
      "is_starter": true
    }
  ]
}
```

### 4. 라인업 수정
```http
PUT /api/v1/lineups/{lineup_id}
```

### 5. 라인업 삭제
```http
DELETE /api/v1/lineups/{lineup_id}
```

### 6. 라인업 복사
```http
POST /api/v1/lineups/{lineup_id}/copy
```

**요청 Body:**
```json
{
  "game_id": 2,
  "name": "복사된 라인업"
}
```

## 📄 PDF 생성 API

### 1. 라인업 PDF 생성
```http
POST /api/v1/lineups/{lineup_id}/pdf
```

**Query Parameters:**
- `format` (optional): PDF 형식 (A4, LETTER, 기본값: A4)
- `orientation` (optional): 방향 (portrait, landscape, 기본값: portrait)

**응답:**
```json
{
  "success": true,
  "data": {
    "pdf_url": "https://example.com/lineup_1.pdf",
    "filename": "lineup_20241225.pdf",
    "size": 1024000,
    "created_at": "2024-12-19T10:30:00Z"
  }
}
```

### 2. PDF 다운로드
```http
GET /api/v1/lineups/{lineup_id}/pdf/download
```

**응답:** PDF 파일 (Content-Type: application/pdf)

### 3. PDF 미리보기
```http
GET /api/v1/lineups/{lineup_id}/pdf/preview
```

**응답:** PDF 파일 (Content-Type: application/pdf)

## 🔍 검색 및 필터링 API

### 1. 선수 검색
```http
GET /api/v1/players/search
```

**Query Parameters:**
- `q` (required): 검색어
- `position` (optional): 포지션 필터
- `limit` (optional): 결과 수 제한

### 2. 경기 검색
```http
GET /api/v1/games/search
```

**Query Parameters:**
- `q` (required): 검색어 (상대팀명, 장소 등)
- `date_from` (optional): 시작 날짜
- `date_to` (optional): 종료 날짜

## 📊 통계 API

### 1. 선수 통계
```http
GET /api/v1/players/{player_id}/stats
```

**응답:**
```json
{
  "success": true,
  "data": {
    "player_id": 1,
    "total_lineups": 15,
    "starter_count": 12,
    "substitute_count": 3,
    "positions": {
      "CF": 10,
      "LF": 5
    },
    "batting_orders": {
      "1": 8,
      "2": 4,
      "3": 3
    }
  }
}
```

### 2. 팀 통계
```http
GET /api/v1/stats/team
```

**응답:**
```json
{
  "success": true,
  "data": {
    "total_players": 25,
    "active_players": 20,
    "total_games": 30,
    "upcoming_games": 5,
    "position_distribution": {
      "P": 3,
      "C": 2,
      "1B": 2,
      "2B": 2,
      "3B": 2,
      "SS": 2,
      "LF": 2,
      "CF": 2,
      "RF": 2,
      "DH": 1
    }
  }
}
```

## 🚨 에러 코드

### HTTP 상태 코드
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `409`: 충돌 (중복 데이터)
- `422`: 유효성 검사 실패
- `500`: 서버 오류

### 에러 코드
- `VALIDATION_ERROR`: 입력 데이터 유효성 검사 실패
- `NOT_FOUND`: 리소스를 찾을 수 없음
- `DUPLICATE_ERROR`: 중복 데이터
- `PERMISSION_DENIED`: 권한 없음
- `INTERNAL_ERROR`: 서버 내부 오류

## 🔧 API 테스트

### Postman Collection
```json
{
  "info": {
    "name": "Line-Up API",
    "description": "야구 라인업 관리 서비스 API"
  },
  "item": [
    {
      "name": "Players",
      "item": [
        {
          "name": "Get Players",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/api/v1/players"
          }
        }
      ]
    }
  ]
}
```

### cURL 예시
```bash
# 선수 목록 조회
curl -X GET "http://localhost:8000/api/v1/players" \
  -H "Content-Type: application/json"

# 선수 등록
curl -X POST "http://localhost:8000/api/v1/players" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "김철수",
    "position": "P",
    "number": 18,
    "phone": "010-1234-5678",
    "email": "kim@example.com"
  }'
```

---

*작성일: 2024년 12월 19일*
*업데이트: API 엔드포인트 및 스펙 정의 완료*
