# 야구 라인업 관리 서비스 배포 현황

## 프로젝트 개요
- **프로젝트명**: 야구 라인업 관리 서비스 (line-up)
- **GitHub 저장소**: https://github.com/ip9202/line-up
- **배포 플랫폼**: Railway (Docker 기반)
- **개발환경**: Python 3.13 (py3_13), React 18, TypeScript

## 현재 상태 (2024-12-19)

### ✅ 완료된 작업
1. **GitHub 저장소 생성 및 연결**
   - 저장소명: `line-up`
   - 계정: `ip9202`
   - 자동 배포 설정 완료

2. **Railway 배포 설정**
   - 3개 서비스 구성: PostgreSQL, Backend, Frontend
   - Docker 기반 배포 환경 구축
   - 환경 변수 설정 완료

3. **백엔드 배포 완료**
   - FastAPI 서버 정상 작동
   - PostgreSQL 데이터베이스 연결
   - JWT 인증 시스템 (8시간 토큰 유효기간)
   - 자동 마이그레이션 설정

4. **프론트엔드 빌드 문제 해결**
   - Docker 환경에서 경로 별칭 문제 해결
   - 모든 import를 상대 경로로 변경
   - vite.config.ts에서 alias 설정 제거

### 🔄 진행 중인 작업
- **프론트엔드 빌드 재시도**: Railway에서 자동 재빌드 진행 중

### 📋 Railway 서비스 구성

#### 1. PostgreSQL 서비스
- **서비스명**: line-up-postgres
- **환경변수**: 자동 설정 (DATABASE_URL)

#### 2. Backend 서비스
- **서비스명**: line-up-backend
- **Dockerfile**: `backend/Dockerfile`
- **포트**: 8000
- **환경변수**:
  - `DATABASE_URL`: PostgreSQL 연결 URL
  - `SECRET_KEY`: JWT 서명 키
  - `ALGORITHM`: HS256
  - `ACCESS_TOKEN_EXPIRE_MINUTES`: 480 (8시간)
  - `ALLOWED_ORIGINS`: 프론트엔드 도메인
  - `ENVIRONMENT`: production
  - `RUN_MIGRATIONS`: true

#### 3. Frontend 서비스
- **서비스명**: line-up-frontend
- **Dockerfile**: `frontend/Dockerfile`
- **포트**: 3000
- **환경변수**:
  - `VITE_API_BASE_URL`: 백엔드 API URL

### 🛠️ 기술 스택

#### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Migration**: Alembic
- **Authentication**: JWT
- **Python**: 3.13

#### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **HTTP Client**: Axios

#### Infrastructure
- **Containerization**: Docker
- **Deployment**: Railway
- **Version Control**: Git/GitHub
- **Environment**: Conda (py3_13)

### 🔧 해결된 주요 문제들

1. **경로 별칭 문제**
   - 문제: Docker 환경에서 `@/lib/api` 경로 해석 실패
   - 해결: 모든 import를 상대 경로 `../lib/api`로 변경

2. **JWT 토큰 만료**
   - 문제: 15분 후 자동 로그아웃
   - 해결: 토큰 유효기간을 8시간으로 연장

3. **데이터 무결성**
   - 문제: 연결된 데이터 삭제 시 참조 무결성 오류
   - 해결: 삭제 전 연결된 데이터 존재 여부 확인 및 알림

### 📁 주요 파일 구조
```
line-up/
├── backend/
│   ├── Dockerfile
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routers/
│   │   └── utils/
│   └── requirements.txt
├── frontend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── lib/
│   └── package.json
├── Procfile
├── railway.json
├── runtime.txt
└── docker-compose.yml
```

### 🚀 배포 상태
- **백엔드**: ✅ 배포 완료
- **프론트엔드**: 🔄 빌드 재시도 중
- **데이터베이스**: ✅ 연결 완료

### 📝 다음 단계
1. 프론트엔드 빌드 성공 확인
2. 도메인 설정
3. 웹사이트 접속 테스트
4. 기능 테스트 및 검증

### 🔗 관련 링크
- **GitHub 저장소**: https://github.com/ip9202/line-up
- **Railway 대시보드**: https://railway.app/dashboard
- **개발 서버**: http://localhost:3000 (프론트엔드), http://localhost:8000 (백엔드)

---
*문서 작성일: 2024년 12월 19일*
*작성자: AI Assistant*

