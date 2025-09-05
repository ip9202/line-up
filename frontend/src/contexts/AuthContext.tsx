import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { User, LoginRequest, LoginResponse } from '../types/auth'
import { loginWithToken, logout as authLogout } from '../services/authService'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => void
  logout: () => void
  isLoading: boolean
  error: any
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // 로그인 뮤테이션
  const loginMutation = useMutation({
    mutationFn: loginWithToken,
    onSuccess: (data: LoginResponse) => {
      const { access_token, user: userData } = data
      
      // 토큰과 사용자 정보를 localStorage에 저장
      localStorage.setItem('auth_token', access_token)
      localStorage.setItem('auth_user', JSON.stringify(userData))
      
      // axios 기본 헤더에 토큰 설정
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      // 상태 즉시 업데이트
      setUser(userData)
      setToken(access_token)
      setIsAuthenticated(true)
    },
    onError: (error) => {
      console.error('로그인 실패:', error)
    },
  })

  // 로그아웃 함수
  const logout = useCallback(() => {
    authLogout()
    setUser(null)
    setToken(null)
    setIsAuthenticated(false)
    
    // axios 기본 헤더에서 토큰 제거
    delete axios.defaults.headers.common['Authorization']
    
    // 모든 쿼리 캐시 무효화
    queryClient.clear()
    
    // 메인페이지로 이동
    navigate('/')
  }, [queryClient, navigate])

  // 컴포넌트 마운트 시 저장된 인증 정보 복원
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('auth_user')
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr)
        setUser(userData)
        setToken(token)
        setIsAuthenticated(true)
        
        // axios 기본 헤더에 토큰 설정
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch (error) {
        console.error('저장된 인증 정보 파싱 실패:', error)
        logout()
      }
    }
    
    // 로딩 완료
    setIsLoading(false)
  }, [logout])


  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    login: loginMutation.mutate,
    logout,
    isLoading: isLoading || loginMutation.isPending,
    error: loginMutation.error,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
