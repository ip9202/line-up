# 야구 라인업 관리 시스템 - 프로젝트 현황

## 📅 최종 업데이트: 2025-01-03 14:30

## 🎯 프로젝트 개요
야구팀의 선수 관리, 경기 일정 관리, 라인업 구성 및 출력을 위한 웹 기반 관리 시스템

## 🏗️ 기술 스택

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL (Railway)
- **ORM**: SQLAlchemy
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt (passlib)
- **PDF Generation**: ReportLab
- **Image Processing**: Pillow
- **Migration**: Alembic
- **Environment**: Conda (py3_12)

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Data Fetching**: React Query
- **Drag & Drop**: React DnD

### Infrastructure
- **Local Development**: Conda `py3_13` (Python 3.13.1)
- **Production Deployment**: Railway (Python 3.13 via Docker)
- **Deployment Method**: GitHub 연동 자동 배포
- **Version Control**: Git

## 🚀 현재 구현 상태

### ✅ 완료된 기능

#### 1. 인증 시스템
- **JWT 기반 로그인/로그아웃**
- **역할 기반 권한 관리**
  - 총무 (MANAGER): 선수/경기 관리 권한
  - 감독 (COACH): 라인업 관리 권한
- **React Context API를 통한 전역 인증 상태 관리**
- **자동 토큰 갱신 및 보안 처리**

#### 2. 선수 관리
- **선수 CRUD 기능**
- **선수 정보 필드**:
  - 기본 정보: 이름, 등번호, 나이, 전화번호
  - 역할: 감독, 코치, 총무, 회장, 고문, 선수
  - 상태: 활성/비활성
  - 선수출신 여부 (전문/비전문)
- **정렬 기능**: 등번호, 이름, 역할, 나이, 선수출신, 상태
- **검색 및 필터링**
- **권한 기반 UI 제어**

#### 3. 경기 관리
- **경기 정보 관리**
- **권한 기반 접근 제어** (총무만 CUD 가능)
- **경기 상태 관리**

#### 4. 라인업 관리
- **라인업 생성/수정/삭제**
- **드래그 앤 드롭 인터페이스**
- **포지션 및 타순 배치**
- **권한 기반 접근 제어** (감독만 CUD 가능)

#### 5. PDF 출력
- **라인업 A4 출력**
- **한글 폰트 지원** (Helvetica)
- **프린터 및 다운로드 기능**

### 🔧 백엔드 API 구조

#### 인증 API (`/api/v1/auth/`)
- `POST /token` - 로그인
- `POST /register` - 회원가입
- `GET /me` - 현재 사용자 정보

#### 선수 관리 API (`/api/v1/players/`)
- `GET /` - 선수 목록 조회
- `GET /{id}` - 선수 상세 조회
- `POST /` - 선수 등록 (총무만)
- `PUT /{id}` - 선수 수정 (총무만)
- `DELETE /{id}` - 선수 삭제 (총무만)

#### 경기 관리 API (`/api/v1/games/`)
- `GET /` - 경기 목록 조회
- `GET /{id}` - 경기 상세 조회
- `POST /` - 경기 등록 (총무만)
- `PUT /{id}` - 경기 수정 (총무만)
- `DELETE /{id}` - 경기 삭제 (총무만)

#### 라인업 관리 API (`/api/v1/lineups/`)
- `GET /` - 라인업 목록 조회
- `GET /{id}` - 라인업 상세 조회
- `POST /` - 라인업 생성 (감독만)
- `PUT /{id}` - 라인업 수정 (감독만)
- `DELETE /{id}` - 라인업 삭제 (감독만)
- `POST /{id}/players` - 라인업에 선수 추가 (감독만)
- `DELETE /{id}/players/{player_id}` - 라인업에서 선수 제거 (감독만)
- `POST /{id}/copy` - 라인업 복사 (감독만)

#### PDF API (`/api/v1/pdf/`)
- `GET /lineup/{lineup_id}` - 라인업 PDF 생성

### 🎨 프론트엔드 구조

#### 페이지 구성
- **Dashboard** (`/`) - 메인 대시보드
- **Players** (`/players`) - 선수 관리
- **Games** (`/games`) - 경기 관리
- **LineupEditor** (`/lineup/editor`) - 라인업 편집
- **LineupList** (`/lineup/list`) - 라인업 목록

#### 주요 컴포넌트
- **AuthContext** - 전역 인증 상태 관리
- **Header** - 네비게이션 및 로그인/로그아웃
- **LoginModal** - 로그인 모달
- **PlayerForm** - 선수 등록/수정 폼
- **LineupEditor** - 라인업 편집기
- **LineupCard** - 라인업 카드

### 🔐 권한 체계

| 기능 | 총무 | 감독 | 로그아웃 |
|------|------|------|----------|
| **선수 관리** | ✅ CUD | 👁️ R | 👁️ R |
| **경기 관리** | ✅ CUD | 👁️ R | 👁️ R |
| **라인업 관리** | 👁️ R | ✅ CUD | 👁️ R |

- **CUD**: Create, Update, Delete
- **R**: Read (읽기 전용)

### 🗄️ 데이터베이스 스키마

#### Users 테이블
- `id` (Primary Key)
- `username` (Unique)
- `password_hash`
- `role` (총무/감독)
- `is_active`
- `created_at`, `updated_at`

#### Players 테이블
- `id` (Primary Key)
- `name` (Required)
- `uniform_number`
- `age`
- `phone` (Required)
- `email`
- `role` (Enum: 감독, 코치, 총무, 회장, 고문, 선수)
- `is_active`
- `is_professional` (Boolean)
- `created_at`, `updated_at`

#### Games 테이블
- `id` (Primary Key)
- `opponent`
- `game_date`
- `location`
- `is_home`
- `status`
- `created_at`, `updated_at`

#### Lineups 테이블
- `id` (Primary Key)
- `name`
- `game_id` (Foreign Key)
- `created_at`, `updated_at`

#### LineupPlayers 테이블
- `id` (Primary Key)
- `lineup_id` (Foreign Key)
- `player_id` (Foreign Key)
- `position`
- `batting_order` (0-9, 0은 투수)
- `created_at`, `updated_at`

## 🚧 현재 이슈 및 해결 상태

### ✅ 해결된 이슈
1. **로그인 후 UI 업데이트 문제** - React Context API로 해결
2. **Chrome 비밀번호 관리 알림** - 표준 HTML 속성으로 복원
3. **백엔드 API 엔드포인트 불일치** - `/login` → `/token`으로 수정
4. **권한 기반 UI 제어** - 모든 화면에 권한 체크 적용
5. **백엔드 API 권한 보호** - 모든 CUD 엔드포인트에 인증/권한 체크 추가

### 🔄 현재 상태
- **백엔드 서버**: 정상 동작 (포트 8002)
- **프론트엔드**: 정상 동작 (포트 3001)
- **데이터베이스**: PostgreSQL (Railway)
- **인증 시스템**: 완전 구현 및 테스트 완료

## 📋 다음 단계 계획

### 우선순위 1: 데이터 연동
- [ ] 실제 선수 데이터 CRUD 연동
- [ ] 실제 경기 데이터 CRUD 연동
- [ ] 실제 라인업 데이터 CRUD 연동

### 우선순위 2: UI/UX 개선
- [ ] 반응형 디자인 최적화
- [ ] 로딩 상태 및 에러 처리 개선
- [ ] 사용자 피드백 메시지 추가

### 우선순위 3: 고급 기능
- [ ] 라인업 템플릿 기능
- [ ] 통계 및 분석 기능
- [ ] 알림 시스템

## 🛠️ 개발 환경 설정

### ⚠️ 중요: Python 환경 설정
- **로컬 개발**: 반드시 `conda py3_13` 환경 사용
- **프로덕션**: Railway에서 Python 3.13 실행
- **GitHub 배포**: main 브랜치 푸시 시 자동 배포

### 로컬 개발 실행
```bash
# 백엔드 실행 (py3_13 환경 필수!)
cd backend
conda activate py3_13
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload

# 프론트엔드 실행
cd frontend
npm install
npm run dev
```

### Docker 개발 환경
```bash
# 데이터베이스 실행
docker-compose up -d db

# 백엔드 실행 (별도 터미널, py3_13 환경 필수!)
cd backend
conda activate py3_13
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

### Railway 배포 설정
```bash
# GitHub 연동 자동 배포
git push origin main  # 자동으로 Railway에 배포됨
```

## 📝 주요 변경사항 히스토리

### 2025-01-03
- ✅ 인증 시스템 완전 구현
- ✅ 권한 기반 UI 제어 완료
- ✅ 백엔드 API 권한 보호 완료
- ✅ Chrome 비밀번호 관리 기능 복원
- ✅ React Context API로 전역 상태 관리 개선

### 2025-01-02
- ✅ 선수 관리 화면 구현
- ✅ 라인업 에디터 기본 구조 구현
- ✅ PDF 출력 기능 구현
- ✅ 데이터베이스 스키마 설계 및 마이그레이션

## 🎉 성과 요약

1. **완전한 인증 시스템 구축** - JWT 기반 로그인/로그아웃
2. **역할 기반 권한 관리** - 총무/감독 역할별 접근 제어
3. **반응형 UI 구현** - 모던하고 직관적인 사용자 인터페이스
4. **안전한 API 설계** - 모든 엔드포인트에 적절한 권한 체크
5. **확장 가능한 아키텍처** - 모듈화된 구조로 유지보수성 확보

---

**프로젝트 상태**: 🟢 안정적 (핵심 기능 완료)  
**다음 마일스톤**: 실제 데이터 연동 및 UI/UX 개선
