import api from '../lib/api'
import { LoginRequest, LoginResponse, User } from '../types/auth'

export interface PasswordChangeRequest {
  current_password: string
  new_password: string
}

export interface PasswordChangeResponse {
  message: string
}

// 토큰 기반 로그인
export const loginWithToken = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const params = new URLSearchParams()
  params.append('username', credentials.username)
  params.append('password', credentials.password)
  
  const response = await api.post<LoginResponse>('/auth/token', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  })
  return response.data
}

// 현재 사용자 정보 조회
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me')
  return response.data
}

// 비밀번호 변경
export const changePassword = async (passwordData: PasswordChangeRequest): Promise<PasswordChangeResponse> => {
  const response = await api.post('/auth/change-password', passwordData)
  return response.data
}

// 토큰 유효성 검증
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return true
  } catch {
    return false
  }
}

// 로그아웃 (로컬 스토리지 정리)
export const logout = (): void => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
}
