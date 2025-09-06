# 🛠️ Line-Up 개발 가이드

## ⚠️ 중요: 개발 환경 설정 규칙

```bash
개발 시: conda activate py3_13 (가상환경 사용)
배포 시: 실사용 Python (가상환경 미사용)
```

## 🚀 빠른 시작

### 1. 개발 환경 설정
```bash
# conda 환경 활성화 (필수!)
conda activate py3_13

# 프로젝트 클론
git clone <repository-url>
cd line-up

# Docker 서비스 시작
docker-compose up -d
```

### 2. 백엔드 개발 서버 시작
```bash
cd backend

# 의존성 설치
pip install -r requirements.txt

# 데이터베이스 마이그레이션
alembic upgrade head

# 개발 서버 실행
python -m uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

### 3. 프론트엔드 개발 서버 시작
```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 4. 서비스 접속
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8002
- **API 문서**: http://localhost:8002/docs
- **데이터베이스**: localhost:5433

## 🐍 Python 환경 관리

### conda 환경 설정
```bash
# 환경 생성 (최초 1회)
conda create -n py3_13 python=3.13.1

# 환경 활성화 (개발 시 항상 실행)
conda activate py3_13

# Python 버전 확인
python --version  # Python 3.13.1

# 패키지 설치
pip install package_name
```

### 개발 시작 전 체크리스트
- [ ] `conda activate py3_13` 실행 (필수!)
- [ ] Python 버전 확인 (3.13.1)
- [ ] Docker 서비스 실행 상태 확인
- [ ] 데이터베이스 연결 확인

## 🗄️ 데이터베이스 관리

### Alembic 마이그레이션
```bash
# 마이그레이션 파일 생성
alembic revision --autogenerate -m "마이그레이션 설명"

# 마이그레이션 적용
alembic upgrade head

# 마이그레이션 롤백
alembic downgrade -1

# 마이그레이션 히스토리 확인
alembic history
```

### Docker 데이터베이스 관리
```bash
# 데이터베이스만 시작
docker-compose up -d db

# 모든 서비스 시작
docker-compose up -d

# 서비스 중지
docker-compose down

# 데이터베이스 초기화 (주의!)
docker-compose down -v
docker-compose up -d
```

### 데이터베이스 접속
```bash
# PostgreSQL 접속
psql -h localhost -p 5433 -U lineup_user -d lineup_db

# 또는 Docker 컨테이너 직접 접속
docker exec -it lineup_db psql -U lineup_user -d lineup_db
```

## 🔧 개발 워크플로우

### Git 브랜치 전략
```bash
# 기능 개발
git checkout -b feature/새로운기능
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin feature/새로운기능

# 메인 브랜치 병합
git checkout main
git merge feature/새로운기능
git push origin main  # 자동 배포 트리거
```

### 커밋 메시지 규칙
```bash
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가
chore: 빌드 업무 수정
```

### 코드 작성 규칙

#### 백엔드 (Python/FastAPI)
```python
# 타입 힌트 필수
def get_player(db: Session, player_id: int) -> Optional[Player]:
    return db.query(Player).filter(Player.id == player_id).first()

# 에러 핸들링
try:
    player = create_player(db, player_data)
except Exception as e:
    logger.error(f"선수 생성 실패: {e}")
    raise HTTPException(status_code=400, detail="선수 생성에 실패했습니다")

# API 문서화
@router.post("/players", response_model=PlayerResponse)
def create_player(
    player: PlayerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    새로운 선수를 등록합니다.
    
    - **name**: 선수 이름 (필수)
    - **position**: 포지션 (선택)
    - **number**: 등번호 (선택)
    """
```

#### 프론트엔드 (React/TypeScript)
```typescript
// 타입 정의 필수
interface Player {
  id: number
  name: string
  number?: string
  position: string
}

// 컴포넌트
const PlayerCard: React.FC<{ player: Player }> = ({ player }) => {
  return (
    <div className="bg-white rounded-lg p-4">
      <h3>{player.name}</h3>
      <span>{player.position}</span>
    </div>
  )
}

// 커스텀 훅
const usePlayers = () => {
  return useQuery({
    queryKey: ['players'],
    queryFn: () => api.getPlayers(),
    staleTime: 5 * 60 * 1000, // 5분
  })
}
```

## 🚀 배포 가이드

### Railway 자동 배포 (권장)
```bash
# GitHub에 푸시하면 자동으로 Railway에 배포됨
git add .
git commit -m "feat: 새로운 기능 추가"
git push origin main  # 자동 배포 트리거

# 배포 상태 확인
# Railway 대시보드에서 배포 로그 확인
```

### Railway 수동 배포
```bash
# Railway CLI 설치
npm install -g @railway/cli

# Railway 로그인
railway login

# 프로젝트 연결
railway link

# 수동 배포
railway up
```

### 환경 변수 설정

#### 로컬 개발 (.env)
```bash
DATABASE_URL=postgresql://lineup_user:lineup_password@localhost:5433/lineup_db
SECRET_KEY=your-local-secret-key
DEBUG=True
CORS_ORIGINS=http://localhost:3000
```

#### Railway 프로덕션
```bash
# Railway 대시보드에서 설정
DATABASE_URL=postgresql://...  # Railway에서 자동 생성
SECRET_KEY=your-production-secret-key
DEBUG=False
CORS_ORIGINS=https://your-domain.railway.app
```

### 배포 전 체크리스트
- [ ] 로컬에서 모든 기능 테스트
- [ ] 데이터베이스 마이그레이션 확인
- [ ] 환경 변수 설정 확인
- [ ] CORS 설정 확인
- [ ] 빌드 에러 없음 확인

## 🧪 테스트

### 백엔드 테스트
```bash
cd backend

# 테스트 실행
pytest

# 커버리지 포함 테스트
pytest --cov=app

# 특정 테스트 파일 실행
pytest tests/test_players.py
```

### 프론트엔드 테스트
```bash
cd frontend

# 단위 테스트
npm test

# 커버리지 포함 테스트
npm test -- --coverage

# E2E 테스트 (Playwright)
npx playwright test
```

### API 테스트 예시
```bash
# 선수 목록 조회
curl http://localhost:8002/api/v1/players/

# 경기 목록 조회  
curl http://localhost:8002/api/v1/games/

# 라인업 상세 조회
curl http://localhost:8002/api/v1/lineups/2

# 인증 토큰 포함 요청
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8002/api/v1/players/
```

## 🐛 디버깅 가이드

### 일반적인 문제들

#### 1. conda 환경 미활성화
```bash
# 문제: Python 3.13이 아닌 다른 버전 사용
python --version  # Python 3.9.x

# 해결
conda activate py3_13
python --version  # Python 3.13.1
```

#### 2. Docker 컨테이너 상태 확인
```bash
# 컨테이너 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# 컨테이너 재시작
docker-compose restart backend
```

#### 3. React useEffect 무한루프
```typescript
// 문제: 의존성 배열에 함수 포함
useEffect(() => {
  // ...
}, [searchParams, refetchFunction])  // refetchFunction이 매번 새로 생성

// 해결: 함수를 의존성에서 제거하거나 useCallback 사용
useEffect(() => {
  // ...
}, [searchParams])

// 또는
const stableRefetch = useCallback(refetchFunction, [])
useEffect(() => {
  // ...
}, [searchParams, stableRefetch])
```

#### 4. JavaScript falsy value 처리
```typescript
// 문제: 0이나 빈 문자열이 의도치 않게 처리됨
const displayNumber = player?.number || '없음'  // 0이 '없음'으로 표시

// 해결: 명시적 null/undefined 체크
const displayNumber = player?.number !== undefined && player?.number !== null 
  ? player.number 
  : '없음'
```

### 로그 확인 방법

#### 백엔드 로그
```bash
# FastAPI 로그
tail -f logs/app.log

# Docker 로그
docker-compose logs -f backend
```

#### 프론트엔드 로그
```javascript
// 브라우저 개발자 도구 Console 탭
console.log('디버그 정보:', data)
console.error('에러 발생:', error)

// React Query 디버그
import { ReactQueryDevtools } from 'react-query/devtools'
// 개발 도구에서 쿼리 상태 확인
```

## 🔄 트러블슈팅

### 데이터베이스 연결 오류
```bash
# 1. PostgreSQL 컨테이너 상태 확인
docker-compose ps db

# 2. 데이터베이스 접속 테스트
docker exec -it lineup_db pg_isready

# 3. 컨테이너 재시작
docker-compose restart db

# 4. 완전 초기화 (주의: 데이터 손실)
docker-compose down -v
docker-compose up -d
```

### Railway 배포 실패
```bash
# 1. 빌드 로그 확인
railway logs

# 2. 환경 변수 확인
railway variables

# 3. 수동 배포 시도
railway up --detach

# 4. GitHub 연동 재설정
railway link --repo
```

### CORS 오류
```python
# backend/app/main.py에서 CORS 설정 확인
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-domain.railway.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 📋 개발 도구

### 추천 VSCode 확장
```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.black-formatter",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### 유용한 명령어
```bash
# 프로젝트 전체 검색
grep -r "검색어" --include="*.py" --include="*.tsx" .

# 포트 사용 확인
lsof -i :3000  # 프론트엔드
lsof -i :8002  # 백엔드
lsof -i :5433  # 데이터베이스

# 프로세스 종료
kill -9 PID
```