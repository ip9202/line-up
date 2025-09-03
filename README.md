# 🏟️ Line-Up (야구 라인업 관리 서비스)

> **"이 기획의 처음이자 마지막은 이 한장의 문서로 결정된다"**  
> 모든 개발은 **A4 사이즈 야구 라인업 시트를 프린팅**하기 위해 진행됩니다.

## 📋 프로젝트 개요

야구 경기 라인업을 생성, 관리, A4 프린팅할 수 있는 웹 서비스입니다.  
실제 야구 경기에서 사용할 수 있는 완성도 높은 라인업 시트를 제공합니다.

### 🎯 핵심 기능
- **선수 관리**: 선수 등록, 수정, 삭제
- **경기 관리**: 경기 일정 및 정보 관리
- **라인업 생성**: 드래그앤드롭으로 포지션/타순 배치
- **라인업 저장**: 라인업 저장 및 불러오기
- **PDF 생성**: A4 사이즈 라인업 시트 생성
- **프린팅**: 브라우저 프린트 + PDF 다운로드

## 🏗️ 기술 스택

### Backend
- **Python 3.13** (conda 가상환경 py3_13)
- **FastAPI**: 웹 프레임워크
- **SQLAlchemy**: ORM
- **PostgreSQL**: 데이터베이스
- **ReportLab**: PDF 생성
- **Pillow**: 이미지 처리

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS**: 스타일링
- **React DnD**: 드래그앤드롭
- **React Query**: 상태 관리

### 개발 환경
- **Docker**: 로컬 개발 환경
- **conda**: Python 환경 관리
- **Railway**: 클라우드 배포

## 🚀 빠른 시작

### ⚠️ 중요: 개발 환경 설정 규칙
```
개발 시: conda activate py3_13 (가상환경 사용)
배포 시: 실사용 Python (가상환경 미사용)
```

### 1. 개발 환경 설정
```bash
# conda 환경 활성화
conda activate py3_13

# 프로젝트 클론
git clone <repository-url>
cd line-up

# Docker 서비스 시작
docker-compose up -d

# 백엔드 개발 서버 시작
cd backend
uvicorn app.main:app --reload

# 프론트엔드 개발 서버 시작 (새 터미널)
cd frontend
npm install
npm start
```

### 2. 데이터베이스 설정
```bash
# 마이그레이션 생성
alembic revision --autogenerate -m "Initial migration"

# 마이그레이션 실행
alembic upgrade head
```

### 3. 서비스 접속
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs

## 📁 프로젝트 구조

```
line-up/
├── backend/                    # FastAPI 백엔드
│   ├── app/
│   │   ├── models/            # 데이터베이스 모델
│   │   ├── routers/           # API 라우터
│   │   ├── services/          # 비즈니스 로직
│   │   ├── utils/             # 유틸리티 함수
│   │   └── schemas/           # Pydantic 스키마
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                  # React 프론트엔드
│   ├── src/
│   │   ├── components/        # UI 컴포넌트
│   │   ├── pages/             # 페이지 컴포넌트
│   │   ├── hooks/             # 커스텀 훅
│   │   └── utils/             # 유틸리티 함수
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml         # 로컬 개발 환경
├── railway.toml              # Railway 배포 설정
└── docs/                     # 프로젝트 문서
    ├── PROJECT_PLAN.md       # 프로젝트 기획서
    ├── TECHNICAL_SPEC.md     # 기술 스펙
    ├── DATABASE_DESIGN.md    # 데이터베이스 설계
    └── API_DESIGN.md         # API 설계
```

## 📚 문서

- [📋 프로젝트 기획서](PROJECT_PLAN.md)
- [🔧 기술 스펙](TECHNICAL_SPEC.md)
- [🗄️ 데이터베이스 설계](DATABASE_DESIGN.md)
- [🔌 API 설계](API_DESIGN.md)

## 🎨 UI/UX 디자인

### 디자인 컨셉
- **모던하고 깔끔한 디자인**
- **회색 플랫 UI** (사용자 선호도 반영)
- **로또 번호 볼 스타일**의 색상 포인트
- **픽토그램 스타일** 아이콘 사용

### 주요 화면
1. **대시보드**: 최근 경기 및 라인업 현황
2. **선수 관리**: 선수 목록 및 상세 정보
3. **경기 관리**: 경기 일정 및 정보 관리
4. **라인업 생성**: 드래그앤드롭 라인업 편집기
5. **라인업 목록**: 저장된 라인업 관리
6. **프린트 미리보기**: A4 라인업 시트 미리보기

## 🔧 개발 가이드

### 개발 시작 전 체크리스트
- [ ] `conda activate py3_13` 실행
- [ ] Python 버전 확인 (3.13.1)
- [ ] Docker 서비스 실행 상태 확인
- [ ] 데이터베이스 연결 확인

### 코드 작성 규칙
- TypeScript 타입 정의 필수
- API 문서화 (FastAPI 자동 생성)
- 에러 핸들링 구현
- 로깅 추가

### 배포 전 체크리스트
- [ ] 테스트 실행
- [ ] 환경 변수 설정 확인
- [ ] Docker 이미지 빌드 테스트
- [ ] Railway 배포 설정 확인

## 🚀 배포

### Railway 배포
```bash
# Railway CLI 설치
npm install -g @railway/cli

# Railway 로그인
railway login

# 프로젝트 배포
railway up
```

### 환경 변수 설정
```bash
# Railway에서 설정할 환경 변수
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000,https://your-domain.railway.app
```

## 📊 데이터베이스 스키마

### 주요 테이블
- **players**: 선수 정보
- **games**: 경기 정보
- **lineups**: 라인업 정보
- **lineup_players**: 라인업 선수 정보

자세한 스키마는 [데이터베이스 설계 문서](DATABASE_DESIGN.md)를 참조하세요.

## 🔌 API 엔드포인트

### 주요 API
- `GET /api/v1/players` - 선수 목록 조회
- `POST /api/v1/players` - 선수 등록
- `GET /api/v1/games` - 경기 목록 조회
- `POST /api/v1/games` - 경기 등록
- `GET /api/v1/lineups` - 라인업 목록 조회
- `POST /api/v1/lineups` - 라인업 생성
- `POST /api/v1/lineups/{id}/pdf` - PDF 생성

자세한 API 스펙은 [API 설계 문서](API_DESIGN.md)를 참조하세요.

## 🧪 테스트

```bash
# 백엔드 테스트
cd backend
pytest

# 프론트엔드 테스트
cd frontend
npm test
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 연락처

프로젝트 링크: [https://github.com/your-username/line-up](https://github.com/your-username/line-up)

---

*작성일: 2024년 12월 19일*  
*프로젝트명: Line-Up (야구 라인업 관리 서비스)*
