// 선수 역할 타입 (백엔드와 일치)
export type PlayerRole = '선수' | '감독' | '코치' | '총무' | '회장' | '고문'

// 역할 우선순위 (라인업에서 표시 순서)
export const ROLE_PRIORITY: Record<PlayerRole, number> = {
  '감독': 1,
  '코치': 2,
  '회장': 3,
  '고문': 4,
  '총무': 5,
  '선수': 6,
}

// 팀 타입
export interface Team {
  id: number
  name: string
  city?: string
  league?: string
  is_active: boolean
  is_our_team: boolean
  created_at: string
  updated_at?: string
}

// 팀 생성/수정 타입
export interface TeamCreate {
  name: string
  city?: string
  league?: string
  is_active?: boolean
  is_our_team?: boolean
}

export interface TeamUpdate {
  name?: string
  city?: string
  league?: string
  is_active?: boolean
  is_our_team?: boolean
}

// 경기장 타입
export interface Venue {
  id: number
  name: string
  location?: string
  capacity?: number
  surface_type?: string
  is_indoor?: boolean
  notes?: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface VenueCreate {
  name: string
  location?: string
  capacity?: number
  surface_type?: string
  is_indoor?: boolean
  notes?: string
  is_active?: boolean
}

export interface VenueUpdate {
  name?: string
  location?: string
  capacity?: number
  surface_type?: string
  is_indoor?: boolean
  notes?: string
  is_active?: boolean
}

// 선수 타입
export interface Player {
  id: number
  name: string
  number?: number
  phone: string
  email?: string
  photo_url?: string
  team_id?: number
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
  team_id?: number
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
  team_id?: number
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
  game_date: string
  venue_id: number
  opponent_team_id: number
  is_home: boolean
  game_type: string
  status: string
  notes?: string
  created_at: string
  updated_at?: string
  opponent_team?: Team
  venue?: Venue
}

// 경기 생성/수정 타입
export interface GameCreate {
  game_date: string
  venue_id: number
  opponent_team_id: number
  is_home: boolean
  game_type?: string
  status?: string
  notes?: string
}

export interface GameUpdate {
  game_date?: string
  venue_id?: number
  opponent_team_id?: number
  is_home?: boolean
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
  game?: {
    id: number
    game_date: string
    is_home: boolean
    game_type: string
    status: string
    opponent_team?: {
      id: number
      name: string
    }
    venue?: {
      id: number
      name: string
      location?: string
    }
  }
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
