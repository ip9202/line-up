import axios from 'axios'

// API 기본 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'http://localhost:8002/api/v1' : 'https://line-up-backend-production.up.railway.app/api/v1')

// 디버깅용 로그
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
console.log('API_BASE_URL:', API_BASE_URL)
console.log('DEV mode:', import.meta.env.DEV)

// HTTPS 강제 설정 - 개발서버와 프로덕션 서버 구분
let FORCE_HTTPS_URL = API_BASE_URL
if (import.meta.env.DEV) {
  // 개발서버에서는 localhost이므로 HTTP 유지
  console.log('개발서버 - HTTP URL 유지:', FORCE_HTTPS_URL)
} else {
  // 프로덕션에서는 HTTP를 HTTPS로 변환
  if (API_BASE_URL.startsWith('http://')) {
    FORCE_HTTPS_URL = API_BASE_URL.replace('http://', 'https://')
    console.log('프로덕션 - HTTP를 HTTPS로 변환:', FORCE_HTTPS_URL)
  } else {
    console.log('프로덕션 - 이미 HTTPS URL:', FORCE_HTTPS_URL)
  }
}

export const api = axios.create({
  baseURL: FORCE_HTTPS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // HTTPS 강제 설정
  httpsAgent: {
    rejectUnauthorized: false // 개발 환경에서만 사용
  },
  // 요청 URL 강제 HTTPS 변환
  transformRequest: [(data, headers) => {
    // 요청 URL이 HTTP로 시작하면 HTTPS로 변경
    if (headers && headers.url && headers.url.startsWith('http://')) {
      headers.url = headers.url.replace('http://', 'https://')
    }
    return data
  }]
})

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    // URL 강제 HTTPS 변환
    if (config.url && config.url.startsWith('http://')) {
      config.url = config.url.replace('http://', 'https://')
      console.log('URL 강제 HTTPS 변환:', config.url)
    }
    
    // baseURL 강제 HTTPS 변환
    if (config.baseURL && config.baseURL.startsWith('http://')) {
      config.baseURL = config.baseURL.replace('http://', 'https://')
      console.log('baseURL 강제 HTTPS 변환:', config.baseURL)
    }
    
    // 모든 환경에서 요청 정보 로그 출력
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    console.log('Full URL:', `${config.baseURL}${config.url}`)
    console.log('Request config:', {
      baseURL: config.baseURL,
      url: config.url,
      method: config.method,
      headers: config.headers
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
