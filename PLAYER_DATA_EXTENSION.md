# 👥 선수 데이터 확장 계획

> **작성일**: 2024년 12월 19일  
> **프로젝트**: Line-Up 야구 라인업 관리 서비스

---

## 📋 선수 데이터 확장 개요

### 핵심 원칙
- **확장성**: 향후 추가 필드에 대비한 유연한 설계
- **선택적 입력**: 모든 추가 필드는 선택사항
- **단계적 구현**: MVP부터 시작하여 점진적 확장

---

## 🎯 현재 확정된 필드

### 기본 정보 (필수)
- `name`: 선수 이름
- `number`: 등번호
- `phone`: 연락처
- `email`: 이메일
- `photo_url`: 사진 URL

### 확장 필드 (선택사항)
- `age`: 나이
- `birth_date`: 생년월일
- `hometown`: 출신지
- `school`: 학교
- `position_preference`: 선호 포지션 (참고용)
- `height`: 키 (cm)
- `weight`: 몸무게 (kg)
- `join_date`: 입단일
- `notes`: 메모

---

## 🔮 향후 추가 가능한 필드

### 개인 정보
- `blood_type`: 혈액형
- `handedness`: 투타 (우투우타, 좌투좌타 등)
- `family_info`: 가족 정보
- `emergency_contact`: 비상연락처

### 경력 정보
- `career_years`: 경력 년수
- `previous_teams`: 이전 팀
- `awards`: 수상 경력
- `injury_history`: 부상 이력

### 신체 정보
- `body_fat`: 체지방률
- `muscle_mass`: 근육량
- `flexibility_score`: 유연성 점수
- `endurance_score`: 지구력 점수

### 기술 정보
- `batting_average`: 타율
- `era`: 평균자책점
- `fielding_percentage`: 수비율
- `speed_score`: 주루 점수

### 계약 정보
- `contract_start`: 계약 시작일
- `contract_end`: 계약 종료일
- `salary`: 연봉
- `bonus`: 보너스

---

## 🏗️ 데이터베이스 설계 전략

### 1. 확장 가능한 구조
```sql
-- 메인 테이블 (기본 정보)
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    number INTEGER UNIQUE,
    phone VARCHAR(20),
    email VARCHAR(100),
    photo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 확장 정보 테이블 (선택사항)
CREATE TABLE player_profiles (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    age INTEGER,
    birth_date DATE,
    hometown VARCHAR(100),
    school VARCHAR(100),
    position_preference VARCHAR(20),
    height INTEGER,
    weight INTEGER,
    join_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. JSON 필드 활용 (PostgreSQL)
```sql
-- JSON 필드로 확장 정보 저장
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    number INTEGER UNIQUE,
    phone VARCHAR(20),
    email VARCHAR(100),
    photo_url TEXT,
    profile_data JSONB, -- 확장 정보를 JSON으로 저장
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- JSON 필드 인덱스
CREATE INDEX idx_players_profile_data ON players USING GIN (profile_data);
```

---

## 🎨 UI/UX 설계

### 선수 등록 폼 (단계별)
```
┌─────────────────┐
│   기본 정보     │
├─────────────────┤
│ 이름: [입력]    │
│ 등번호: [입력]  │
│ 연락처: [입력]  │
│ 이메일: [입력]  │
│ 사진: [업로드]  │
└─────────────────┘

┌─────────────────┐
│   상세 정보     │
├─────────────────┤
│ 나이: [입력]    │
│ 생년월일: [입력]│
│ 출신지: [입력]  │
│ 학교: [입력]    │
│ 선호포지션: [선택]│
│ 키: [입력]      │
│ 몸무게: [입력]  │
│ 입단일: [입력]  │
│ 메모: [입력]    │
└─────────────────┘
```

### 선수 목록 표시
```
┌─────────────────────────────────────────────────────────┐
│ 이름    │ 등번호 │ 나이 │ 출신지 │ 학교     │ 선호포지션 │
├─────────────────────────────────────────────────────────┤
│ 김철수  │ 18     │ 25   │ 서울   │ 고려대   │ P         │
│ 이영희  │ 25     │ 23   │ 부산   │ 연세대   │ C         │
│ 박민수  │ 7      │ 27   │ 대구   │ 서울대   │ 1B        │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 구현 전략

### 1. 단계별 구현
```javascript
// 1단계: 기본 필드만 구현
const basicPlayerFields = {
  name: '',
  number: '',
  phone: '',
  email: '',
  photo_url: ''
};

// 2단계: 확장 필드 추가
const extendedPlayerFields = {
  ...basicPlayerFields,
  age: '',
  birth_date: '',
  hometown: '',
  school: '',
  position_preference: '',
  height: '',
  weight: '',
  join_date: '',
  notes: ''
};
```

### 2. 동적 폼 생성
```javascript
// 필드 설정을 통한 동적 폼 생성
const playerFieldConfig = [
  { name: 'name', label: '이름', type: 'text', required: true },
  { name: 'number', label: '등번호', type: 'number', required: true },
  { name: 'age', label: '나이', type: 'number', required: false },
  { name: 'hometown', label: '출신지', type: 'text', required: false },
  // ... 추가 필드들
];
```

### 3. API 버전 관리
```javascript
// API 버전별 필드 지원
const apiVersions = {
  v1: ['name', 'number', 'phone', 'email', 'photo_url'],
  v2: [...v1, 'age', 'birth_date', 'hometown', 'school'],
  v3: [...v2, 'position_preference', 'height', 'weight', 'join_date', 'notes']
};
```

---

## 📊 마이그레이션 전략

### 1. 기존 데이터 호환성
```sql
-- 기존 테이블에 새 컬럼 추가
ALTER TABLE players ADD COLUMN age INTEGER;
ALTER TABLE players ADD COLUMN birth_date DATE;
ALTER TABLE players ADD COLUMN hometown VARCHAR(100);
-- ... 추가 컬럼들
```

### 2. 데이터 검증
```python
# 마이그레이션 시 데이터 검증
def validate_player_data(player_data):
    errors = []
    
    if player_data.get('age') and player_data['age'] < 0:
        errors.append('나이는 0 이상이어야 합니다')
    
    if player_data.get('height') and player_data['height'] < 100:
        errors.append('키는 100cm 이상이어야 합니다')
    
    return errors
```

---

## 🎯 우선순위 및 일정

### Phase 1: 기본 필드 (MVP)
- [ ] name, number, phone, email, photo_url
- [ ] 기본 CRUD 기능
- [ ] 간단한 목록 표시

### Phase 2: 확장 필드 1차
- [ ] age, birth_date, hometown, school
- [ ] 선수 상세 정보 표시
- [ ] 검색 및 필터링 기능

### Phase 3: 확장 필드 2차
- [ ] position_preference, height, weight
- [ ] 입단일, 메모
- [ ] 통계 및 분석 기능

### Phase 4: 고급 필드
- [ ] 경력 정보
- [ ] 신체 정보
- [ ] 기술 정보
- [ ] 계약 정보

---

## ⚠️ 주의사항

### 1. 데이터 일관성
- 필수 필드와 선택 필드 명확히 구분
- 데이터 검증 규칙 정의
- 중복 데이터 방지

### 2. 성능 고려사항
- 인덱스 최적화
- 쿼리 성능 모니터링
- 대용량 데이터 처리

### 3. 사용자 경험
- 단계별 입력 폼
- 자동 저장 기능
- 데이터 임포트/익스포트

---

*작성일: 2024년 12월 19일*  
*프로젝트: Line-Up 야구 라인업 관리 서비스*  
*확장 계획: 단계적 구현 + 유연한 설계*
