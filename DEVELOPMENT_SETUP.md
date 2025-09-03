# 🛠️ 개발 환경 설정 가이드

## ⚠️ 중요: Docker 기반 개발 환경

### 환경 요구사항
- **로컬 개발**: Docker & Docker Compose **필수**
- **프로덕션**: Railway (Python 3.13 via Docker)
- **배포**: GitHub 연동 자동 배포

## 🚀 빠른 시작 (Docker)

### 1. 전체 서비스 실행
```bash
# 모든 서비스 실행 (백엔드 + 프론트엔드 + 데이터베이스)
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 2. 개별 서비스 실행
```bash
# 데이터베이스만 실행
docker-compose up -d db

# 백엔드만 실행
docker-compose up -d backend

# 프론트엔드만 실행
docker-compose up -d frontend
```

### 3. 서비스 접속
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8002
- **API 문서**: http://localhost:8002/docs

## 🔧 개발 명령어 (Docker)

### 백엔드 개발
```bash
# 백엔드 컨테이너 재빌드 및 실행
docker-compose up --build -d backend

# 백엔드 로그 확인
docker-compose logs -f backend

# 백엔드 컨테이너 내부 접속
docker-compose exec backend bash

# 데이터베이스 마이그레이션 (컨테이너 내부에서)
docker-compose exec backend alembic upgrade head
```

### 프론트엔드 개발
```bash
# 프론트엔드 컨테이너 재빌드 및 실행
docker-compose up --build -d frontend

# 프론트엔드 로그 확인
docker-compose logs -f frontend

# 프론트엔드 컨테이너 내부 접속
docker-compose exec frontend sh
```

## 🐳 Docker 개발 환경 상세

### 서비스 관리
```bash
# 모든 서비스 실행
docker-compose up -d

# 특정 서비스만 실행
docker-compose up -d db backend frontend

# 서비스 중지
docker-compose down

# 서비스 재시작
docker-compose restart

# 로그 확인
docker-compose logs -f [service_name]
```

### 데이터베이스 관리
```bash
# PostgreSQL만 실행
docker-compose up -d db

# 데이터베이스 접속
docker-compose exec db psql -U lineup_user -d lineup_db

# 데이터베이스 백업
docker-compose exec db pg_dump -U lineup_user lineup_db > backup.sql

# 데이터베이스 복원
docker-compose exec -T db psql -U lineup_user lineup_db < backup.sql
```

## 🚀 배포

### GitHub 연동 자동 배포 (권장)
```bash
# 코드 변경 후
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin main  # 자동으로 Railway에 배포됨
```

### Railway 수동 배포
```bash
# Railway CLI 설치
npm install -g @railway/cli

# Railway 로그인
railway login

# 프로젝트 배포
railway up
```

## 🔍 문제 해결

### Docker 컨테이너 문제
```bash
# 컨테이너 상태 확인
docker-compose ps

# 컨테이너 재시작
docker-compose restart [service_name]

# 컨테이너 재빌드
docker-compose up --build -d [service_name]

# 모든 컨테이너 중지 및 삭제
docker-compose down
docker-compose up -d
```

### 포트 충돌 문제
```bash
# 사용 중인 포트 확인
lsof -i :3000  # 프론트엔드
lsof -i :8002  # 백엔드
lsof -i :5433  # 데이터베이스

# Docker 컨테이너 중지
docker-compose down
```

### 데이터베이스 연결 문제
```bash
# 데이터베이스 컨테이너 상태 확인
docker-compose ps db

# 데이터베이스 재시작
docker-compose restart db

# 데이터베이스 로그 확인
docker-compose logs db

# 데이터베이스 연결 테스트
docker-compose exec db pg_isready -U lineup_user
```

## 📝 환경 변수

### 로컬 개발 (.env)
```bash
# Database
DATABASE_URL=postgresql://lineup_user:lineup_password@localhost:5433/lineup_db

# Environment
ENVIRONMENT=development
DEBUG=True

# Security
SECRET_KEY=your-secret-key-here

# CORS
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Railway 프로덕션
```bash
# Railway 대시보드에서 설정
DATABASE_URL=postgresql://...  # Railway PostgreSQL URL
SECRET_KEY=your-production-secret-key
CORS_ORIGINS=https://your-domain.railway.app
```

## 🎯 개발 워크플로우 (Docker)

### 1. 기능 개발
```bash
# 새 브랜치 생성
git checkout -b feature/new-feature

# 개발 진행
# ... 코드 수정 ...

# 변경사항 테스트
docker-compose up --build -d

# 커밋
git add .
git commit -m "feat: 새로운 기능 추가"
```

### 2. 테스트
```bash
# 백엔드 테스트 (컨테이너 내부에서)
docker-compose exec backend pytest

# 프론트엔드 테스트 (컨테이너 내부에서)
docker-compose exec frontend npm test

# 전체 서비스 테스트
docker-compose up -d
# 브라우저에서 http://localhost:3000 접속하여 테스트
```

### 3. 배포
```bash
# main 브랜치로 머지
git checkout main
git merge feature/new-feature

# GitHub에 푸시 (자동 배포)
git push origin main
```

## 📚 추가 리소스

- [FastAPI 문서](https://fastapi.tiangolo.com/)
- [React 문서](https://react.dev/)
- [Tailwind CSS 문서](https://tailwindcss.com/)
- [Railway 문서](https://docs.railway.app/)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)

---

**⚠️ 중요**: 모든 개발 작업은 Docker 컨테이너에서 수행됩니다!
