# Railway 배포 가이드 및 문제 해결

## 개요
야구 라인업 관리 시스템을 Railway 클라우드 플랫폼에 배포하는 과정에서 발생한 문제점들과 해결 방법을 정리한 문서입니다.

## 배포된 서비스
- **백엔드 API**: https://line-up-backend-production.up.railway.app
- **프론트엔드**: https://line-up-frontend-production.up.railway.app
- **데이터베이스**: PostgreSQL (Railway 제공)

## 프로젝트 구조
```
line-up/
├── backend/          # FastAPI 백엔드
├── frontend/         # React + Vite 프론트엔드
├── package.json      # 루트 레벨 패키지 (monorepo 지원)
└── railway.toml      # Railway 배포 설정
```

## 발생한 문제점들과 해결 방법

### 1. 백엔드 배포 문제

#### 문제 1-1: pip 명령어 찾을 수 없음
```
pip: command not found
```

**원인**: nixpacks 환경에서 Python 패키지가 제대로 설치되지 않음

**해결책**:
```toml
# nixpacks.toml
[phases.setup]
nixPkgs = ["python3", "python3Packages.pip", "postgresql", "gcc", "pkg-config", "curl"]
```

#### 문제 1-2: pip externally-managed-environment 에러
```
error: externally-managed-environment
```

**원인**: Python 환경이 외부 관리 모드로 설정됨

**해결책**:
```toml
[phases.install]
cmds = [
    "cd /app/backend && pip install --user --break-system-packages -r requirements.txt"
]
```

#### 문제 1-3: uvicorn 명령어 찾을 수 없음
```
uvicorn: command not found
```

**원인**: 사용자 로컬 설치 경로가 PATH에 포함되지 않음

**해결책**:
```toml
[start]
cmd = "cd /app/backend && export PATH=$HOME/.local/bin:$PATH && python3 -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
```

### 2. 프론트엔드 배포 문제

#### 문제 2-1: nixpacks와 Node.js 감지 충돌
**원인**: 루트에 nixpacks.toml이 있으면 자동 Node.js 감지가 작동하지 않음

**해결책**: 
1. nixpacks.toml을 nixpacks.toml.backup으로 백업
2. Railway가 자동으로 Node.js 프로젝트로 감지하도록 설정

#### 문제 2-2: import 경로 해석 실패
```
Could not resolve "../lib/api" from "src/pages/LineupSheetPage.tsx"
```

**원인**: Railway 빌드 환경에서 Vite alias가 제대로 작동하지 않음

**해결책**:
1. 절대경로 alias 대신 상대경로 사용
```typescript
// 변경 전
import api from '@/lib/api'

// 변경 후  
import api from '../lib/api'
```

#### 문제 2-3: gitignore로 인한 파일 제외
**원인**: `.gitignore`의 `lib/` 패턴이 `frontend/src/lib/api.ts` 파일을 제외시킴

**해결책**:
```gitignore
# lib/ - commented out to allow frontend/src/lib/
```

#### 문제 2-4: Railway 헬스체크 차단
```
Blocked request. This host ("healthcheck.railway.app") is not allowed.
```

**해결책**:
```typescript
// vite.config.ts
preview: {
  host: true,
  port: parseInt(process.env.PORT || '3000'),
  allowedHosts: ['healthcheck.railway.app', 'line-up-frontend-production.up.railway.app']
}
```

#### 문제 2-5: 자체 도메인 접근 차단  
```
Blocked request. This host ("line-up-frontend-production.up.railway.app") is not allowed.
```

**해결책**: allowedHosts에 자체 도메인도 추가

### 3. CORS 및 환경변수 설정

#### 문제 3-1: 프론트엔드에서 백엔드 API 접근 불가
**해결책**: 
1. 백엔드 CORS 설정에 프론트엔드 도메인 추가
```python
# backend/app/main.py
allowed_origins = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000", 
    "https://line-up-frontend-production.up.railway.app"  # 추가
]
```

2. 프론트엔드 환경변수 설정
```
VITE_API_BASE_URL=https://line-up-backend-production.up.railway.app/api/v1
```

## Railway 배포 설정 파일들

### package.json (루트)
```json
{
  "name": "line-up-monorepo",
  "version": "1.0.0",
  "scripts": {
    "build": "cd frontend && npm run build",
    "start": "cd frontend && npm run preview -- --host 0.0.0.0 --port ${PORT:-3000}"
  },
  "workspaces": ["frontend"]
}
```

### railway.toml
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "cd frontend && npm run preview -- --host 0.0.0.0 --port $PORT"
```

### nixpacks.toml.backup (백엔드용 - 비활성화됨)
```toml
[phases.setup]
nixPkgs = ["python3", "python3Packages.pip", "postgresql", "gcc", "pkg-config", "curl", "nodejs", "npm"]

[phases.install]
cmds = [
    "cd /app/backend && pip install --user --break-system-packages -r requirements.txt"
]

[start]
cmd = "cd /app/backend && export PATH=$HOME/.local/bin:$PATH && python3 -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
```

## Railway 서비스 설정

### 백엔드 서비스
- **Root Directory**: `backend`
- **Build Command**: 자동 감지 (Python)
- **Start Command**: 자동 감지
- **Environment Variables**: 
  - `DATABASE_URL`: Railway PostgreSQL 연결 URL (자동)
  - `SECRET_KEY`: JWT 시크릿 키

### 프론트엔드 서비스  
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Start Command**: `npm run preview -- --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: 백엔드 API URL

## 배포 프로세스

1. **Railway 프로젝트 생성**
2. **백엔드 서비스 생성 및 PostgreSQL 연결**
3. **백엔드 배포 및 도메인 생성**
4. **프론트엔드 서비스 생성**
5. **프론트엔드 배포 및 도메인 생성** 
6. **환경변수 설정**
7. **CORS 설정 업데이트**
8. **최종 테스트**

## 중요한 교훈들

1. **gitignore 주의**: 배포에 필요한 파일이 제외되지 않도록 주의
2. **경로 해석**: 클라우드 환경에서는 절대경로보다 상대경로가 더 안정적일 수 있음
3. **nixpacks 충돌**: 여러 언어 프로젝트에서는 자동 감지와 수동 설정 사이의 충돌 가능성
4. **Vite preview 설정**: 프로덕션 환경에서는 allowedHosts 설정이 필수
5. **CORS 설정**: 프론트엔드와 백엔드 도메인 모두 정확히 설정해야 함

## 추가 참고사항

- Railway는 GitHub 연동 시 자동 배포가 가능함
- 환경변수 변경 시 자동 재배포됨  
- 도메인 생성은 배포 완료 후 가능함
- PostgreSQL 데이터베이스는 Railway에서 자동 제공됨

## 최종 결과
모든 문제를 해결한 후 성공적으로 배포 완료:
- ✅ 백엔드 API 정상 작동
- ✅ 프론트엔드 웹앱 정상 작동  
- ✅ 데이터베이스 연결 성공
- ✅ CORS 통신 정상
- ✅ 인증 시스템 작동

---
작성일: 2025년 1월 6일
작성자: Claude Code Assistant