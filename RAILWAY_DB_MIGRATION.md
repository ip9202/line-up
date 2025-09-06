# Railway 프로덕션 데이터베이스 스키마 변경 성공

## 문제 상황
- **개발서버 (Docker)**: `players.number` 컬럼이 VARCHAR(10) ✅
- **프로덕션서버 (Railway)**: `players.number` 컬럼이 INTEGER ❌
- **결과**: 0번과 00번 선수 번호를 구분할 수 없는 문제 발생

## 해결 과정

### 1. Railway CLI 연결 상태 확인
```bash
railway --version  # 4.6.3
railway status     # Project: line-up-managerment, Environment: production
railway variables  # DATABASE_PUBLIC_URL 확인
```

### 2. PostgreSQL 직접 연결 및 스키마 변경
```bash
# 현재 컬럼 타입 확인
psql "postgresql://postgres:***@caboose.proxy.rlwy.net:45514/railway" \
  -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'number';"

# 결과: number | integer

# 스키마 변경 실행
psql "postgresql://postgres:***@caboose.proxy.rlwy.net:45514/railway" \
  -c "ALTER TABLE players ALTER COLUMN number TYPE VARCHAR(10);"

# 결과: ALTER TABLE (성공!)

# 변경 결과 확인
psql "postgresql://postgres:***@caboose.proxy.rlwy.net:45514/railway" \
  -c "SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'number';"

# 결과: number | character varying | 10
```

## 결과
✅ **성공적으로 프로덕션 데이터베이스에서 `players.number` 컬럼을 `INTEGER` → `VARCHAR(10)`으로 변경**

- 이제 0번과 00번 선수 번호를 구분하여 저장 가능
- 개발서버와 프로덕션서버 스키마 통일 완료
- Railway CLI를 통한 직접 데이터베이스 접속 성공

## 사용된 도구
- **Railway CLI**: 프로젝트 연결 및 환경변수 확인
- **PostgreSQL psql**: 직접 데이터베이스 연결 및 스키마 변경
- **DATABASE_PUBLIC_URL**: Railway에서 제공하는 외부 접속 URL 활용

## 실행 날짜
2025-09-06

## 실행자
Claude Code (AI Assistant)