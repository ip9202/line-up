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

### 4. 포트 정보
| 서비스 | 포트 | 설명 |
|--------|------|------|
| 프론트엔드 | 3000 | React 개발 서버 |
| 백엔드 API | 8002 | FastAPI 서버 |
| 데이터베이스 | 5433 | PostgreSQL |
| API 문서 | 8002/docs | Swagger UI |

### 5. 로컬 Python 작업 (필요시)
```bash
# conda py3_13 환경 활성화 (로컬 Python 스크립트 실행시 필요)
conda activate py3_13

# 데이터베이스 마이그레이션 (로컬에서 직접 실행시)
cd backend
alembic upgrade head

# 기본 사용자 생성 (로컬에서 직접 실행시)
python create_default_users.py
```

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

# 또는 로컬에서 직접 실행 (conda 환경 필요)
conda activate py3_13
cd backend
alembic upgrade head
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

### Python 환경 문제 (로컬 작업시)
```bash
# conda 환경 확인
conda info --envs

# py3_13 환경이 없다면 생성
conda create -n py3_13 python=3.13

# 환경 활성화
conda activate py3_13

# Python 버전 확인
python --version  # Python 3.13.1이어야 함
```

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
lsof -i :3000  # 프론트엔드 (React)
lsof -i :8002  # 백엔드 (FastAPI)
lsof -i :5433  # 데이터베이스 (PostgreSQL)

# 특정 포트 사용 프로세스 확인
lsof -i :3000 | grep LISTEN
lsof -i :8002 | grep LISTEN
lsof -i :5433 | grep LISTEN

# Docker 컨테이너 중지
docker-compose down

# 포트 사용 프로세스 강제 종료 (필요시)
sudo kill -9 $(lsof -t -i:3000)
sudo kill -9 $(lsof -t -i:8002)
sudo kill -9 $(lsof -t -i:5433)
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

## 📱 반응형 UI & 모바일 최적화

### 모바일 친화적 디자인
- **반응형 레이아웃**: Tailwind CSS의 `sm:`, `md:`, `lg:`, `xl:` 브레이크포인트 활용
- **모바일 네비게이션**: 햄버거 메뉴 (☰)로 사이드바 토글
- **터치 친화적**: 버튼 크기 최적화, 적절한 간격 설정
- **카드 기반 UI**: 모바일에서 테이블 대신 카드 형태로 정보 표시

### 주요 반응형 컴포넌트
- **Header**: 모바일에서 햄버거 메뉴, 데스크톱에서 전체 네비게이션
- **Sidebar**: 모바일에서 슬라이드 오버레이, 데스크톱에서 고정 사이드바
- **Player List**: 모바일에서 2컬럼 카드, 데스크톱에서 테이블
- **Login Modal**: 모바일 최적화된 크기와 레이아웃

### 브레이크포인트
```css
/* Tailwind CSS 브레이크포인트 */
sm: 640px   /* 모바일 가로 */
md: 768px   /* 태블릿 */
lg: 1024px  /* 데스크톱 */
xl: 1280px  /* 대형 데스크톱 */
```

### 모바일 테스트
```bash
# 개발 서버 실행
docker-compose up -d

# 브라우저 개발자 도구에서 모바일 뷰 테스트
# Chrome DevTools > Toggle device toolbar
# 다양한 디바이스 크기로 테스트
```

## 📚 추가 리소스

- [FastAPI 문서](https://fastapi.tiangolo.com/)
- [React 문서](https://react.dev/)
- [Tailwind CSS 문서](https://tailwindcss.com/)
- [Railway 문서](https://docs.railway.app/)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [Tailwind CSS 반응형 디자인](https://tailwindcss.com/docs/responsive-design)

---

**⚠️ 중요**: 
- **일반 개발 작업**: Docker 컨테이너에서 수행
- **로컬 Python 스크립트 실행**: `conda activate py3_13` 환경에서 수행
- **모바일 테스트**: 브라우저 개발자 도구에서 다양한 디바이스 크기로 테스트
