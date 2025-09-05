// 애플리케이션 상수 정의

// 게임 상태
export const GAME_STATUS = {
  SCHEDULED: '예정',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CANCELLED: '취소',
} as const

// 게임 타입
export const GAME_TYPE = {
  REGULAR: '정규경기',
  FRIENDLY: '친선경기',
  TOURNAMENT: '대회',
  PRACTICE: '연습경기',
} as const

// 야구 포지션
export const BASEBALL_POSITIONS = [
  '투수',
  '포수', 
  '1루수',
  '2루수',
  '3루수',
  '유격수',
  '좌익수',
  '중견수',
  '우익수',
  '지명타자',
] as const

// 페이지네이션 기본값
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

// API 엔드포인트 (개발 환경용)
export const API_ENDPOINTS = {
  AUTH: '/auth',
  PLAYERS: '/players',
  TEAMS: '/teams',
  GAMES: '/games', 
  LINEUPS: '/lineups',
  VENUES: '/venues',
  PDF: '/pdf',
  EXCEL: '/excel',
} as const