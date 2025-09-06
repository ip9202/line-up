# 🔧 최근 수정사항 (2025-09-06)

## 📋 주요 개선사항

### 1. 라인업 시트 선수목록 필터링
**문제**: 이미 라인업에 배치된 선수들이 오른쪽 선수목록에 중복 표시
**해결**: 라인업에 포함된 선수 ID를 Set으로 관리하여 필터링

```tsx
// 라인업에 포함된 선수 ID들
const lineupPlayerIds = new Set(lineup.lineup_players.map(lp => lp.player_id))
// 라인업에 포함되지 않은 선수들만 필터링
const availablePlayers = allPlayers.filter(player => !lineupPlayerIds.has(player.id))
```

**적용 파일**: 
- `frontend/src/components/LineupSheet.tsx`
- `frontend/src/pages/LineupSheetPage.tsx`

### 2. JavaScript falsy value 처리 개선
**문제**: 등번호 '0', '00'이 빈 문자열로 표시되는 오류
**원인**: `player?.number || ''`에서 숫자 0이 falsy로 처리됨
**해결**: 명시적 undefined/null 체크로 변경

```tsx
// Before (잘못된 방식)
player?.number || ''

// After (올바른 방식) 
player?.number !== undefined && player?.number !== null ? player.number : ''
```

### 3. React useEffect 무한루프 해결
**문제**: LineupEditor에서 페이지가 계속 리프레시되는 현상
**원인**: useEffect 의존성 배열에 `refetchLineups` 함수 포함
**해결**: 의존성 배열에서 `refetchLineups` 제거

```tsx
// Before
useEffect(() => {
  // ...
}, [searchParams, lineups, lineupsLoading, gamesLoading, refetchLineups])

// After  
useEffect(() => {
  // ...
}, [searchParams, lineups, lineupsLoading, gamesLoading])
```

### 4. 시트보기 버튼 동작 개선
**문제**: 시트보기 버튼이 새창에서 열림
**해결**: `window.open()`을 `navigate()`로 변경

```tsx
// Before
onClick={() => window.open(`/lineup/sheet/${selectedLineupId}`, '_blank')}

// After
onClick={() => navigate(`/lineup/sheet/${selectedLineupId}`)}
```

### 5. 백엔드 데이터 무결성 개선
**문제**: 선수 추가 시 중복 키 오류 발생
**해결**: 기존 선수 삭제 후 새 선수 추가하는 순차 처리

```python
# 같은 타순에 기존 선수가 있으면 모두 삭제 (교체)
existing_players = db.query(LineupPlayer).filter(
    LineupPlayer.lineup_id == lineup_id,
    LineupPlayer.batting_order == player_data.batting_order
).all()

for existing_player in existing_players:
    db.delete(existing_player)

# 변경사항을 먼저 커밋하여 unique constraint 충돌 방지
db.commit()
```

### 6. Pydantic 스키마 검증 개선
**문제**: 선수 정보의 phone 필드 검증 오류
**해결**: PlayerInfo 스키마에서 phone을 Optional[str]로 수정

```python
class PlayerInfo(BaseModel):
    id: int
    name: str
    number: Optional[str] = None  # Optional[int] → Optional[str]
    phone: Optional[str] = None   # str → Optional[str] 
    email: Optional[str] = None
    # ...
```

### 7. 시트뷰 고정 행수 적용
**요구사항**: 시트뷰에서 항상 27개 행 표시 (빈 데이터는 공백으로)
**해결**: Array.from을 사용하여 고정 27행 생성

```tsx
{Array.from({ length: 27 }, (_, index) => {
  const player = availablePlayers[index]
  return (
    <tr key={index}>
      <td>{player ? (index + 1) : ''}</td>
      <td>{player?.name || ''}</td>
      <td>{player ? displayNumber(player) : ''}</td>
      <td>{player?.role || ''}</td>
    </tr>
  )
})}
```

## 🚀 배포 정보

**커밋**: `18156fc` - "fix: 시트보기 버튼을 현재 창에서 열리도록 수정 및 백엔드 오류 해결"
**배포**: Railway 자동 배포 완료
**URL**: https://line-up-frontend-production.up.railway.app

## 🔍 주요 교훈

### 1. React useEffect 의존성 관리의 중요성
- 함수를 의존성 배열에 넣을 때는 해당 함수가 매번 새로 생성되는지 확인
- `useCallback`을 사용하거나 의존성에서 제외하는 방법 고려

### 2. JavaScript falsy value 처리
- `||` 연산자 사용 시 0, '', false 등 falsy 값 주의
- 명시적 null/undefined 체크가 더 안전

### 3. 데이터베이스 제약조건 처리
- UNIQUE 제약조건이 있는 경우 INSERT 전 DELETE 고려
- 트랜잭션 중간 커밋으로 제약조건 충돌 방지

### 4. Docker 컨테이너 상태 모니터링
- 컨테이너가 unhealthy 상태가 되면 API 호출 실패
- 정기적인 상태 체크와 재시작 필요

## 📁 수정된 파일 목록

### Frontend
- `src/components/LineupSheet.tsx` - 선수목록 필터링, 등번호 표시 개선, 27행 고정
- `src/pages/LineupSheetPage.tsx` - 프린트 시 데이터 일관성, 선수목록 필터링
- `src/pages/LineupEditor.tsx` - useEffect 무한루프 해결, 시트보기 버튼 수정

### Backend  
- `app/routers/lineups.py` - 선수 추가 로직 개선, 중복 키 오류 해결
- `app/schemas/lineup.py` - PlayerInfo 스키마 검증 개선

## ✅ 테스트 완료사항

- [x] 라인업 시트에서 배치된 선수 필터링 정상 작동
- [x] 등번호 0, 00 올바른 표시 확인
- [x] 시트보기 버튼 현재 창에서 열기 확인  
- [x] 선수 추가/삭제 정상 작동 확인
- [x] 프린트 시 데이터 일관성 확인
- [x] 27행 고정 표시 확인
- [x] Railway 배포 정상 작동 확인

---
*수정일: 2025년 9월 6일*  
*담당: Claude Code Assistant*