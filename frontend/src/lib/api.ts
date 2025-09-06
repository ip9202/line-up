import axios from 'axios'

// API 기본 설정 - 개발환경에서는 무조건 HTTP 사용
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:8002/api/v1'  // 개발환경: 항상 HTTP
  : (import.meta.env.VITE_API_BASE_URL || 'https://line-up-backend-production.up.railway.app/api/v1')  // 프로덕션: 환경변수 또는 기본 HTTPS

// 디버깅용 로그
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
console.log('API_BASE_URL:', API_BASE_URL)
console.log('DEV mode:', import.meta.env.DEV)

// 최종 API URL - 개발환경에서는 HTTP 강제
const FINAL_URL = API_BASE_URL
console.log('최종 API URL:', FINAL_URL)

export const api = axios.create({
  baseURL: FINAL_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 개발환경에서는 프로토콜 강제 설정하지 않음
  ...(import.meta.env.PROD && { protocol: 'https:' }),
  // 요청 타임아웃 설정
  timeout: 10000,
  // transformRequest 제거 - Axios 기본 동작 사용
})

// Axios 기본 설정 강제 적용
axios.defaults.baseURL = FINAL_URL
axios.defaults.timeout = 10000

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    // 개발환경에서는 모든 URL을 HTTP로 강제 변환
    if (import.meta.env.DEV) {
      if (config.baseURL && config.baseURL.startsWith('https://')) {
        config.baseURL = config.baseURL.replace('https://', 'http://')
      }
      if (config.url && config.url.includes('https://')) {
        config.url = config.url.replace('https://', 'http://')
      }
      console.log('개발서버 - HTTP로 강제 변환:', `${config.baseURL}${config.url}`)
    } else {
      // 프로덕션에서만 HTTPS 강제 변환
      if (config.url) {
        config.url = config.url.replace('http://', 'https://')
      }
      
      if (config.baseURL) {
        config.baseURL = config.baseURL.replace('http://', 'https://')
      }
      console.log('프로덕션서버 - HTTPS 사용:', `${config.baseURL}${config.url}`)
    }
    
    // 모든 환경에서 요청 정보 로그 출력
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    console.log('Full URL:', `${config.baseURL}${config.url}`)
    console.log('Request config:', {
      baseURL: config.baseURL,
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    })
    
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
