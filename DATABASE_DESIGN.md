# 🗄️ 데이터베이스 설계 문서

## 📊 ERD (Entity Relationship Diagram)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Player      │    │      Game       │    │     Lineup      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ name            │    │ date            │    │ game_id (FK)    │
│ position        │    │ time            │    │ name            │
│ number          │    │ venue           │    │ created_at      │
│ phone           │    │ opponent        │    │ updated_at      │
│ email           │    │ game_type       │    └─────────────────┘
│ photo_url       │    │ status          │             │
│ created_at      │    │ created_at      │             │
│ updated_at      │    │ updated_at      │             │
└─────────────────┘    └─────────────────┘             │
         │                       │                      │
         │                       │                      │
         │              ┌─────────────────┐             │
         │              │  LineupPlayer   │             │
         └──────────────┤                 │─────────────┘
                        ├─────────────────┤
                        │ id (PK)         │
                        │ lineup_id (FK)  │
                        │ player_id (FK)  │
                        │ position        │
                        │ batting_order   │
                        │ is_starter      │
                        │ created_at      │
                        └─────────────────┘
```

## 📋 테이블 상세 설계

### 1. Player (선수) 테이블
```sql
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    number INTEGER UNIQUE,
    phone VARCHAR(20),
    email VARCHAR(100),
    photo_url TEXT,
    -- 확장 가능한 필드들 (향후 추가 예정)
    age INTEGER,
    birth_date DATE,
    hometown VARCHAR(100),
    school VARCHAR(100),
    position_preference VARCHAR(20), -- 선호 포지션 (참고용)
    height INTEGER, -- cm
    weight INTEGER, -- kg
    join_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_players_number ON players(number);
CREATE INDEX idx_players_active ON players(is_active);
CREATE INDEX idx_players_name ON players(name);
```

### 2. Game (경기) 테이블
```sql
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    time TIME NOT NULL,
    venue VARCHAR(200) NOT NULL,
    opponent VARCHAR(100) NOT NULL,
    game_type VARCHAR(20) DEFAULT 'REGULAR',  -- 'REGULAR', 'PLAYOFF', 'FRIENDLY'
    status VARCHAR(20) DEFAULT 'SCHEDULED',   -- 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_games_date ON games(date);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_opponent ON games(opponent);
```

### 3. Lineup (라인업) 테이블
```sql
CREATE TABLE lineups (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_lineups_game_id ON lineups(game_id);
CREATE INDEX idx_lineups_default ON lineups(is_default);
```

### 4. LineupPlayer (라인업 선수) 테이블
```sql
CREATE TABLE lineup_players (
    id SERIAL PRIMARY KEY,
    lineup_id INTEGER REFERENCES lineups(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    position VARCHAR(20) NOT NULL,
    batting_order INTEGER NOT NULL CHECK (batting_order >= 1 AND batting_order <= 9),
    is_starter BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lineup_id, position),
    UNIQUE(lineup_id, batting_order)
);

-- 인덱스
CREATE INDEX idx_lineup_players_lineup_id ON lineup_players(lineup_id);
CREATE INDEX idx_lineup_players_player_id ON lineup_players(player_id);
CREATE INDEX idx_lineup_players_position ON lineup_players(position);
CREATE INDEX idx_lineup_players_batting_order ON lineup_players(batting_order);
```

## 🔄 데이터베이스 관계

### 1. Game ↔ Lineup (1:N)
- 하나의 경기는 여러 개의 라인업을 가질 수 있음
- 경기가 삭제되면 관련 라인업도 함께 삭제 (CASCADE)

### 2. Lineup ↔ LineupPlayer (1:N)
- 하나의 라인업은 여러 개의 라인업 선수를 가질 수 있음
- 라인업이 삭제되면 관련 라인업 선수도 함께 삭제 (CASCADE)

### 3. Player ↔ LineupPlayer (1:N)
- 하나의 선수는 여러 라인업에 포함될 수 있음
- 선수가 삭제되면 관련 라인업 선수도 함께 삭제 (CASCADE)

## 📝 SQLAlchemy 모델 정의

### Player 모델
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Date
from sqlalchemy.sql import func
from app.utils.database import Base

class Player(Base):
    __tablename__ = "players"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    number = Column(Integer, unique=True)
    phone = Column(String(20))
    email = Column(String(100))
    photo_url = Column(Text)
    
    # 확장 가능한 필드들 (향후 추가 예정)
    age = Column(Integer)
    birth_date = Column(Date)
    hometown = Column(String(100))
    school = Column(String(100))
    position_preference = Column(String(20))  # 선호 포지션 (참고용)
    height = Column(Integer)  # cm
    weight = Column(Integer)  # kg
    join_date = Column(Date)
    notes = Column(Text)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

### Game 모델
```python
class Game(Base):
    __tablename__ = "games"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)
    venue = Column(String(200), nullable=False)
    opponent = Column(String(100), nullable=False)
    game_type = Column(String(20), default="REGULAR")
    status = Column(String(20), default="SCHEDULED")
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 관계
    lineups = relationship("Lineup", back_populates="game", cascade="all, delete-orphan")
```

### Lineup 모델
```python
class Lineup(Base):
    __tablename__ = "lineups"
    
    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    name = Column(String(200), nullable=False)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 관계
    game = relationship("Game", back_populates="lineups")
    lineup_players = relationship("LineupPlayer", back_populates="lineup", cascade="all, delete-orphan")
```

### LineupPlayer 모델
```python
class LineupPlayer(Base):
    __tablename__ = "lineup_players"
    
    id = Column(Integer, primary_key=True, index=True)
    lineup_id = Column(Integer, ForeignKey("lineups.id"), nullable=False)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    position = Column(String(20), nullable=False)
    batting_order = Column(Integer, nullable=False)
    is_starter = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 관계
    lineup = relationship("Lineup", back_populates="lineup_players")
    player = relationship("Player")
    
    # 제약조건
    __table_args__ = (
        UniqueConstraint('lineup_id', 'position', name='uq_lineup_position'),
        UniqueConstraint('lineup_id', 'batting_order', name='uq_lineup_batting_order'),
        CheckConstraint('batting_order >= 1 AND batting_order <= 9', name='ck_batting_order_range')
    )
```

## 🎯 주요 쿼리 예시

### 1. 특정 경기의 라인업 조회
```sql
SELECT 
    lp.batting_order,
    p.name,
    p.number,
    lp.position,
    lp.is_starter
FROM lineup_players lp
JOIN players p ON lp.player_id = p.id
JOIN lineups l ON lp.lineup_id = l.id
WHERE l.game_id = ? AND l.is_default = TRUE
ORDER BY lp.batting_order;
```

### 2. 활성 선수 목록 조회
```sql
SELECT id, name, position, number
FROM players
WHERE is_active = TRUE
ORDER BY position, number;
```

### 3. 최근 경기 일정 조회
```sql
SELECT id, date, time, venue, opponent, status
FROM games
WHERE date >= CURRENT_DATE
ORDER BY date, time
LIMIT 10;
```

### 4. 선수별 라인업 참여 통계
```sql
SELECT 
    p.name,
    p.position,
    COUNT(lp.id) as lineup_count,
    COUNT(CASE WHEN lp.is_starter = TRUE THEN 1 END) as starter_count
FROM players p
LEFT JOIN lineup_players lp ON p.id = lp.player_id
LEFT JOIN lineups l ON lp.lineup_id = l.id
LEFT JOIN games g ON l.game_id = g.id
WHERE g.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.name, p.position
ORDER BY lineup_count DESC;
```

## 🔧 데이터베이스 마이그레이션

### Alembic 설정
```python
# alembic.ini
[alembic]
script_location = alembic
sqlalchemy.url = postgresql://lineup_user:lineup_password@localhost/lineup_db

# alembic/env.py
from app.models import Base
target_metadata = Base.metadata
```

### 마이그레이션 명령어
```bash
# 초기 마이그레이션 생성
alembic revision --autogenerate -m "Initial migration"

# 마이그레이션 실행
alembic upgrade head

# 마이그레이션 롤백
alembic downgrade -1

# 마이그레이션 히스토리 확인
alembic history
```

## 📊 성능 최적화

### 인덱스 전략
1. **주요 검색 필드**: position, number, date, status
2. **외래키**: 모든 FK에 인덱스 생성
3. **복합 인덱스**: 자주 함께 조회되는 필드들

### 쿼리 최적화
1. **N+1 문제 해결**: eager loading 사용
2. **페이징**: LIMIT/OFFSET 또는 cursor-based pagination
3. **캐싱**: Redis를 통한 자주 조회되는 데이터 캐싱

---

*작성일: 2024년 12월 19일*
*업데이트: 데이터베이스 스키마 및 관계 설계 완료*
