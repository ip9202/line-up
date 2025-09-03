// 인증 관련 타입 정의

export interface User {
  id: number
  username: string
  role: '총무' | '감독'
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}
