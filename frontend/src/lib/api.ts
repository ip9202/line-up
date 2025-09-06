import axios from 'axios'

// API 기본 설정 - Railway 환경에서 강제 HTTPS
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  const defaultUrl = import.meta.env.DEV 
    ? 'http://localhost:8002/api/v1' 
    : 'https://line-up-backend-production.up.railway.app/api/v1'
  
  const baseUrl = envUrl || defaultUrl
  
  // 프로덕션에서는 항상 HTTPS 강제
  if (!import.meta.env.DEV && baseUrl.startsWith('http://')) {
    return baseUrl.replace('http://', 'https://')
  }
  
  return baseUrl
}

const API_BASE_URL = getApiBaseUrl()

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

// Axios 인스턴스 생성 전 URL 재검증 - 개발서버는 HTTP 유지
const FINAL_URL = import.meta.env.DEV 
  ? API_BASE_URL  // 개발서버는 원본 API_BASE_URL 사용 (HTTP)
  : FORCE_HTTPS_URL.replace('http://', 'https://')  // 프로덕션은 HTTPS 강제
console.log('최종 API URL:', FINAL_URL)

export const api = axios.create({
  baseURL: FINAL_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 프로토콜 강제 설정
  protocol: 'https:',
  // 요청 타임아웃 설정
  timeout: 10000,
  // JSON 직렬화 처리 (프로덕션에서만, URLSearchParams 제외)
  transformRequest: [(data, headers) => {
    console.log('transformRequest 실행:', { data, headers })
    // 프로덕션에서만 JSON 직렬화 적용
    if (import.meta.env.PROD && data && typeof data === 'object' && !(data instanceof URLSearchParams)) {
      return JSON.stringify(data)
    }
    return data
  }]
})

// Axios 기본 설정 강제 적용
axios.defaults.baseURL = FINAL_URL
axios.defaults.timeout = 10000

// 요청 인터셉터 - 토큰 자동 추가
api.interceptors.request.use(
  (config) => {
    // 프로덕션에서만 HTTPS 강제 변환
    if (import.meta.env.PROD) {
      if (config.url) {
        config.url = config.url.replace('http://', 'https://')
      }
      
      if (config.baseURL) {
        config.baseURL = config.baseURL.replace('http://', 'https://')
      }
      
      // 최종 URL 재구성
      const finalUrl = `${config.baseURL}${config.url}`
      if (finalUrl.includes('http://')) {
        const httpsUrl = finalUrl.replace('http://', 'https://')
        console.log('최종 URL 강제 HTTPS 변환:', finalUrl, '->', httpsUrl)
        // URL을 직접 설정
        config.url = httpsUrl.replace(config.baseURL || '', '')
      }
    } else {
      console.log('개발서버 - HTTP URL 유지:', `${config.baseURL}${config.url}`)
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
