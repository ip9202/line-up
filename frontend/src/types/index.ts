// 선수 역할 타입
export type PlayerRole = '선수' | '감독' | '코치' | '총무' | '회장' | '고문'

// 선수 타입
export interface Player {
  id: number
  name: string
  number?: number
  phone: string
  email?: string
  photo_url?: string
  role: PlayerRole
  age?: number
  birth_date?: string
  hometown?: string
  school?: string
  position_preference?: string
  height?: number
  weight?: number
  join_date?: string
  is_professional: boolean
  notes?: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

// 선수 생성/수정 타입
export interface PlayerCreate {
  name: string
  number?: number
  phone: string
  email?: string
  photo_url?: string
  role?: PlayerRole
  age?: number
  birth_date?: string
  hometown?: string
  school?: string
  position_preference?: string
  height?: number
  weight?: number
  join_date?: string
  is_professional?: boolean
  notes?: string
  is_active?: boolean
}

export interface PlayerUpdate {
  name?: string
  number?: number
  phone?: string
  email?: string
  photo_url?: string
  role?: PlayerRole
  age?: number
  birth_date?: string
  hometown?: string
  school?: string
  position_preference?: string
  height?: number
  weight?: number
  join_date?: string
  is_professional?: boolean
  notes?: string
  is_active?: boolean
}

// 경기 타입
export interface Game {
  id: number
  date: string
  time: string
  venue: string
  opponent: string
  game_type: string
  status: string
  notes?: string
  created_at: string
  updated_at?: string
}

// 경기 생성/수정 타입
export interface GameCreate {
  date: string
  time: string
  venue: string
  opponent: string
  game_type?: string
  status?: string
  notes?: string
}

export interface GameUpdate {
  date?: string
  time?: string
  venue?: string
  opponent?: string
  game_type?: string
  status?: string
  notes?: string
}

// 라인업 플레이어 타입
export interface LineupPlayer {
  id: number
  player_id: number
  position: string
  batting_order: number
  is_starter: boolean
}

// 라인업 타입
export interface Lineup {
  id: number
  game_id: number
  name: string
  is_default: boolean
  created_at: string
  updated_at?: string
  lineup_players: LineupPlayer[]
}

// 라인업 생성/수정 타입
export interface LineupCreate {
  game_id: number
  name: string
  is_default?: boolean
  lineup_players?: LineupPlayerCreate[]
}

export interface LineupUpdate {
  name?: string
  is_default?: boolean
  lineup_players?: LineupPlayerCreate[]
}

export interface LineupPlayerCreate {
  player_id: number
  position: string
  batting_order: number
  is_starter?: boolean
}

// API 응답 타입
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
