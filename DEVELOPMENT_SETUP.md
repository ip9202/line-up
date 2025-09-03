# 🛠️ 개발 환경 설정 가이드

## ⚠️ 중요: Python 환경 설정

### 환경 요구사항
- **로컬 개발**: `conda py3_13` (Python 3.13.1) **필수**
- **프로덕션**: Railway (Python 3.13 via Docker)
- **배포**: GitHub 연동 자동 배포

## 🚀 빠른 시작

### 1. Python 환경 설정
```bash
# conda py3_13 환경 활성화 (필수!)
conda activate py3_13

# Python 버전 확인
python --version  # Python 3.13.1이어야 함
```

### 2. 백엔드 설정
```bash
# 백엔드 디렉토리로 이동
cd backend

# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정
cp env.example .env
# .env 파일을 편집하여 필요한 값 설정
```

### 3. 데이터베이스 설정
```bash
# Docker로 PostgreSQL 실행
docker-compose up -d db

# 데이터베이스 마이그레이션 실행
alembic upgrade head

# 기본 사용자 생성 (선택사항)
python create_default_users.py
```

### 4. 백엔드 서버 실행
```bash
# 백엔드 서버 시작
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

### 5. 프론트엔드 설정
```bash
# 새 터미널에서 프론트엔드 디렉토리로 이동
cd frontend

# 의존성 설치
npm install

# 프론트엔드 서버 시작
npm run dev
```

## 🔧 개발 명령어

### 백엔드 개발
```bash
# 서버 실행
conda activate py3_13
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload

# 데이터베이스 마이그레이션
alembic revision --autogenerate -m "마이그레이션 메시지"
alembic upgrade head

# 테스트 실행
pytest
```

### 프론트엔드 개발
```bash
# 개발 서버 실행
cd frontend
npm run dev

# 빌드
npm run build

# 타입 체크
npm run type-check
```

## 🐳 Docker 개발 환경

### 전체 서비스 실행
```bash
# 모든 서비스 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 데이터베이스만 실행
```bash
# PostgreSQL만 실행
docker-compose up -d db

# 데이터베이스 접속
docker-compose exec db psql -U lineup_user -d lineup_db
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

### Python 환경 문제
```bash
# conda 환경 확인
conda info --envs

# py3_13 환경이 없다면 생성
conda create -n py3_13 python=3.13

# 환경 활성화
conda activate py3_13
```

### 포트 충돌 문제
```bash
# 사용 중인 포트 확인
lsof -i :8002
lsof -i :3001

# 프로세스 종료
pkill -f "uvicorn app.main:app"
```

### 데이터베이스 연결 문제
```bash
# Docker 컨테이너 상태 확인
docker-compose ps

# 데이터베이스 재시작
docker-compose restart db

# 로그 확인
docker-compose logs db
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

## 🎯 개발 워크플로우

### 1. 기능 개발
```bash
# 새 브랜치 생성
git checkout -b feature/new-feature

# 개발 진행
conda activate py3_13
# ... 개발 작업 ...

# 커밋
git add .
git commit -m "feat: 새로운 기능 추가"
```

### 2. 테스트
```bash
# 백엔드 테스트
cd backend
pytest

# 프론트엔드 테스트
cd frontend
npm test
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

**⚠️ 중요**: 모든 개발 작업은 `conda py3_13` 환경에서 수행해야 합니다!
