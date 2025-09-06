import axios from 'axios'

// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'http://localhost:8002/api/v1' : 'https://line-up-backend-production.up.railway.app/api/v1')

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }
    
    // 토큰 자동 추가
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      if (import.meta.env.DEV) {
        console.log('API 인터셉터 - 토큰 추가됨')
      }
    } else if (import.meta.env.DEV) {
      console.log('API 인터셉터 - 토큰 없음')
    }
    
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.status} ${response.config.url}`)
    }
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default api
