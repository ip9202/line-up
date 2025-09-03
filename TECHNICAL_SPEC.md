# 🔧 기술 스펙 및 개발 환경 가이드

## 🐍 Python 개발 환경 규칙

### ⚠️ 중요: 개발 환경 설정 규칙
```
개발 시: conda activate py3_13 (가상환경 사용)
배포 시: 실사용 Python (가상환경 미사용)
```

### conda 환경 설정
```bash
# 개발 시작 시 항상 실행
conda activate py3_13

# Python 버전 확인
python --version  # Python 3.13.1

# 패키지 설치
conda install package_name
# 또는
pip install package_name
```

## 🏗️ 프로젝트 구조

```
line-up/
├── backend/                    # FastAPI 백엔드
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI 앱 진입점
│   │   ├── models/            # SQLAlchemy 모델
│   │   │   ├── __init__.py
│   │   │   ├── player.py      # 선수 모델
│   │   │   ├── game.py        # 경기 모델
│   │   │   ├── lineup.py      # 라인업 모델
│   │   │   └── lineup_player.py
│   │   ├── routers/           # API 라우터
│   │   │   ├── __init__.py
│   │   │   ├── players.py     # 선수 API
│   │   │   ├── games.py       # 경기 API
│   │   │   ├── lineups.py     # 라인업 API
│   │   │   └── pdf.py         # PDF 생성 API
│   │   ├── services/          # 비즈니스 로직
│   │   │   ├── __init__.py
│   │   │   ├── player_service.py
│   │   │   ├── game_service.py
│   │   │   ├── lineup_service.py
│   │   │   └── pdf_service.py
│   │   ├── utils/             # 유틸리티 함수
│   │   │   ├── __init__.py
│   │   │   ├── database.py    # DB 연결
│   │   │   ├── pdf_generator.py
│   │   │   └── image_processor.py
│   │   └── schemas/           # Pydantic 스키마
│   │       ├── __init__.py
│   │       ├── player.py
│   │       ├── game.py
│   │       └── lineup.py
│   ├── requirements.txt       # Python 패키지 의존성
│   ├── Dockerfile            # 배포용 Docker 이미지
│   └── .env.example          # 환경 변수 예시
├── frontend/                  # React 프론트엔드
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/        # 재사용 가능한 컴포넌트
│   │   │   ├── common/        # 공통 컴포넌트
│   │   │   ├── player/        # 선수 관련 컴포넌트
│   │   │   ├── game/          # 경기 관련 컴포넌트
│   │   │   ├── lineup/        # 라인업 관련 컴포넌트
│   │   │   └── pdf/           # PDF 관련 컴포넌트
│   │   ├── pages/             # 페이지 컴포넌트
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Players.tsx
│   │   │   ├── Games.tsx
│   │   │   ├── LineupEditor.tsx
│   │   │   ├── LineupList.tsx
│   │   │   └── PrintPreview.tsx
│   │   ├── hooks/             # 커스텀 훅
│   │   │   ├── usePlayers.ts
│   │   │   ├── useGames.ts
│   │   │   ├── useLineups.ts
│   │   │   └── useDragAndDrop.ts
│   │   ├── utils/             # 유틸리티 함수
│   │   │   ├── api.ts         # API 호출 함수
│   │   │   ├── constants.ts   # 상수 정의
│   │   │   └── helpers.ts     # 헬퍼 함수
│   │   ├── types/             # TypeScript 타입 정의
│   │   │   ├── player.ts
│   │   │   ├── game.ts
│   │   │   └── lineup.ts
│   │   ├── styles/            # 스타일 파일
│   │   │   ├── globals.css
│   │   │   └── components.css
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── Dockerfile
├── docker-compose.yml         # 로컬 개발 환경
├── docker-compose.prod.yml    # 프로덕션 환경
├── railway.toml              # Railway 배포 설정
├── .gitignore
├── README.md
├── PROJECT_PLAN.md           # 프로젝트 기획서
└── TECHNICAL_SPEC.md         # 기술 스펙 (현재 파일)
```

## 🐳 Docker 구성

### 로컬 개발 환경 (docker-compose.yml)
```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: lineup_db
      POSTGRES_USER: lineup_user
      POSTGRES_PASSWORD: lineup_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://lineup_user:lineup_password@db:5432/lineup_db
    depends_on:
      - db
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm start

volumes:
  postgres_data:
```

### 배포용 Dockerfile (backend)
```dockerfile
FROM python:3.13-slim

WORKDIR /app

# 시스템 패키지 설치
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Python 패키지 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 앱 코드 복사
COPY . .

# 포트 노출
EXPOSE 8000

# 앱 실행
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📦 주요 패키지 의존성

### Backend (requirements.txt)
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.12.1
pydantic==2.5.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
reportlab==4.0.7
pillow==10.1.0
python-dotenv==1.0.0
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-dnd": "^16.0.1",
    "react-dnd-html5-backend": "^16.0.1",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "tailwindcss": "^3.3.0",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0"
  }
}
```

## 🚀 Railway 배포 설정

### railway.toml
```toml
[build]
builder = "dockerfile"
dockerfilePath = "backend/Dockerfile"

[deploy]
startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"

[env]
DATABASE_URL = "${{Postgres.DATABASE_URL}}"
```

### 환경 변수
```bash
# Railway에서 설정할 환경 변수
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000,https://your-domain.railway.app
```

## 🔧 개발 워크플로우

### 1. 개발 환경 시작
```bash
# conda 환경 활성화
conda activate py3_13

# 프로젝트 클론 및 이동
cd /Users/ip9202/develop/vibe/line-up

# Docker 서비스 시작
docker-compose up -d

# 백엔드 개발 서버 시작
cd backend
uvicorn app.main:app --reload

# 프론트엔드 개발 서버 시작 (새 터미널)
cd frontend
npm start
```

### 2. 데이터베이스 마이그레이션
```bash
# 마이그레이션 생성
alembic revision --autogenerate -m "Initial migration"

# 마이그레이션 실행
alembic upgrade head
```

### 3. 배포
```bash
# Railway CLI 설치
npm install -g @railway/cli

# Railway 로그인
railway login

# 프로젝트 배포
railway up
```

## 📋 개발 체크리스트

### 개발 시작 전
- [ ] `conda activate py3_13` 실행
- [ ] Python 버전 확인 (3.13.1)
- [ ] Docker 서비스 실행 상태 확인
- [ ] 데이터베이스 연결 확인

### 코드 작성 시
- [ ] TypeScript 타입 정의
- [ ] API 문서화 (FastAPI 자동 생성)
- [ ] 에러 핸들링 구현
- [ ] 로깅 추가

### 배포 전
- [ ] 테스트 실행
- [ ] 환경 변수 설정 확인
- [ ] Docker 이미지 빌드 테스트
- [ ] Railway 배포 설정 확인

---

*작성일: 2024년 12월 19일*
*업데이트: 개발 환경 규칙 및 기술 스펙 정리*
