# 📚 Line-Up 기술 문서

## 🏗️ 기술 스택

### Backend
- **Python 3.13** (conda 가상환경 `py3_13`)
- **FastAPI**: 웹 프레임워크
- **SQLAlchemy**: ORM
- **PostgreSQL**: 데이터베이스
- **ReportLab**: PDF 생성
- **Pillow**: 이미지 처리
- **JWT**: 인증 시스템

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS**: 스타일링
- **React DnD**: 드래그앤드롭
- **React Query**: 상태 관리
- **React Context API**: 전역 상태 관리

### 개발 환경
- **로컬 개발**: conda `py3_13` (Python 3.13.1)
- **프로덕션**: Railway (Python 3.13 via Docker)
- **배포**: GitHub 연동 자동 배포

## 📊 데이터베이스 설계

### ERD 구조
```
players (선수)          games (경기)           lineups (라인업)
├── id                  ├── id                 ├── id
├── name                ├── game_date          ├── game_id → games.id
├── number              ├── opponent_team_id   ├── name
├── phone               ├── venue_id           ├── is_default
├── email               ├── is_home            ├── created_at
├── role                └── created_at         └── updated_at
├── age                                        
├── is_professional                            lineup_players (라인업선수)
├── is_active                                  ├── id
└── created_at                                 ├── lineup_id → lineups.id
                                               ├── player_id → players.id
teams (팀)              venues (경기장)        ├── position
├── id                  ├── id                 ├── batting_order
├── name                ├── name               └── is_starter
├── is_our_team         ├── address            
└── created_at          └── created_at         
```

### 주요 테이블 설명

#### players (선수)
- 선수 기본 정보 관리
- `role`: '투수', '포수', '내야수', '외야수' 등
- `is_professional`: 프로/아마추어 구분
- `is_active`: 활성/비활성 상태

#### games (경기)
- 경기 일정 및 정보
- `is_home`: 홈/어웨이 구분
- `opponent_team_id`: 상대팀 FK

#### lineups (라인업)
- 경기별 라인업 정보
- `is_default`: 기본 라인업 여부

#### lineup_players (라인업선수)
- 라인업과 선수의 다대다 관계
- `batting_order`: 타순 (1-9)
- `position`: 포지션 ('P', 'C', '1B' 등)

### 제약 조건
- `lineup_players`: (lineup_id, batting_order) UNIQUE
- `teams`: name UNIQUE
- `venues`: name UNIQUE

## 🔌 API 설계

### 인증
```http
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

### 선수 관리
```http
GET    /api/v1/players              # 선수 목록
POST   /api/v1/players              # 선수 생성
GET    /api/v1/players/{id}         # 선수 상세
PUT    /api/v1/players/{id}         # 선수 수정
DELETE /api/v1/players/{id}         # 선수 삭제
```

### 경기 관리
```http
GET    /api/v1/games                # 경기 목록
POST   /api/v1/games                # 경기 생성
GET    /api/v1/games/{id}           # 경기 상세
PUT    /api/v1/games/{id}           # 경기 수정
DELETE /api/v1/games/{id}           # 경기 삭제
```

### 라인업 관리
```http
GET    /api/v1/lineups              # 라인업 목록
POST   /api/v1/lineups              # 라인업 생성
GET    /api/v1/lineups/{id}         # 라인업 상세
PUT    /api/v1/lineups/{id}         # 라인업 수정
DELETE /api/v1/lineups/{id}         # 라인업 삭제

POST   /api/v1/lineups/{id}/players # 라인업에 선수 추가
DELETE /api/v1/lineups/{id}/players/{player_id} # 라인업에서 선수 제거

POST   /api/v1/lineups/{id}/pdf     # PDF 생성
```

### 팀/경기장 관리
```http
GET    /api/v1/teams                # 팀 목록
POST   /api/v1/teams                # 팀 생성
GET    /api/v1/venues               # 경기장 목록
POST   /api/v1/venues               # 경기장 생성
```

### API 응답 형식

#### 성공 응답
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "김철수",
    "position": "투수"
  }
}
```

#### 에러 응답
```json
{
  "status": "error",
  "message": "선수를 찾을 수 없습니다",
  "code": 404
}
```

### 권한 시스템
- **총무**: 선수/경기/팀/경기장 관리
- **감독**: 라인업 관리
- **일반**: 조회 권한만

## 🎨 UI/UX 디자인 시스템

### 디자인 원칙
- **모던하고 깔끔한 디자인**
- **회색 플랫 UI** (사용자 선호도 반영)
- **로또 번호 볼 스타일**의 색상 포인트
- **픽토그램 스타일** 아이콘 사용

### 색상 팔레트
```css
/* Primary Colors */
--blue-50: #eff6ff;
--blue-600: #2563eb;
--blue-700: #1d4ed8;

/* Gray Scale */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-600: #4b5563;
--gray-900: #111827;

/* Status Colors */
--green-600: #059669;  /* 성공 */
--red-600: #dc2626;    /* 에러 */
--orange-600: #ea580c; /* 경고 */
```

### 컴포넌트 스타일

#### 버튼
```tsx
// Primary Button
className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"

// Secondary Button  
className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"

// Danger Button
className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
```

#### 카드
```tsx
className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
```

#### 입력 필드
```tsx
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
```

### 반응형 디자인
- **Mobile First**: 모바일 우선 설계
- **Breakpoints**: sm(640px), md(768px), lg(1024px), xl(1280px)
- **Grid System**: CSS Grid + Flexbox

### 아이콘 시스템
- **라이브러리**: Lucide React
- **스타일**: 픽토그램 스타일, 일관된 선 두께
- **크기**: 기본 16px (h-4 w-4), 헤더 24px (h-6 w-6)

## 🔒 보안 가이드

### 인증/권한
- JWT 토큰 기반 인증
- 역할별 접근 제어 (RBAC)
- 토큰 만료 시간: 24시간

### 데이터 보안
- SQL Injection 방지 (SQLAlchemy ORM)
- XSS 방지 (입력 값 검증)
- CORS 설정으로 도메인 제한

### 환경 변수 관리
```bash
# 필수 환경 변수
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000
```

## 📱 프론트엔드 아키텍처

### 폴더 구조
```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── common/         # 공통 컴포넌트 (Button, Modal 등)
│   ├── LineupEditor/   # 라인업 편집 관련
│   └── forms/          # 폼 컴포넌트들
├── pages/              # 페이지 컴포넌트
├── hooks/              # 커스텀 훅
├── contexts/           # React Context
├── services/           # API 서비스
├── types/              # TypeScript 타입 정의
└── utils/              # 유틸리티 함수
```

### 상태 관리
- **React Query**: 서버 상태 관리
- **React Context**: 전역 상태 (인증 등)
- **useState/useEffect**: 컴포넌트 로컬 상태

### 주요 훅
```typescript
// API 훅들
useGames()           // 경기 목록
useLineups()         // 라인업 목록
usePlayers()         // 선수 목록
useAuth()            // 인증 상태

// 커스텀 훅들
useLocalStorage()    // 로컬 스토리지 관리
useDebounce()        // 디바운싱
```

## 🚀 성능 최적화

### 프론트엔드
- **Code Splitting**: React.lazy()로 라우트별 분할
- **Memoization**: React.memo, useMemo, useCallback 적절 사용
- **이미지 최적화**: WebP 형식 사용
- **번들 크기 최적화**: Tree shaking, 불필요한 라이브러리 제거

### 백엔드
- **데이터베이스 인덱스**: 자주 조회되는 컬럼에 인덱스 추가
- **N+1 문제 해결**: SQLAlchemy 관계 로딩 최적화
- **캐싱**: Redis 캐시 (필요시)
- **API 페이지네이션**: 대용량 데이터 처리

### 배포 최적화
- **CDN**: 정적 파일 배포
- **Gzip 압축**: 응답 크기 최소화
- **HTTP/2**: 다중 연결 지원