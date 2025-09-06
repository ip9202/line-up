import api from '../lib/api'
import { API_ENDPOINTS, PAGINATION } from '../constants'

// 기본 API 서비스 클래스
export class BaseApiService<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  constructor(private endpoint: string) {}

  // 목록 조회
  async getAll(params?: {
    skip?: number
    limit?: number
    [key: string]: any
  }): Promise<T[]> {
    // 디버깅용 로그 추가
    console.log('BaseApiService getAll 호출:', {
      endpoint: this.endpoint,
      params,
      baseURL: api.defaults.baseURL
    })
    
    const response = await api.get(this.endpoint, { params })
    return response.data
  }

  // 상세 조회
  async getById(id: number): Promise<T> {
    const url = `${this.endpoint}${this.endpoint.endsWith('/') ? '' : '/'}${id}`
    const response = await api.get(url)
    return response.data
  }

  // 생성
  async create(data: TCreate): Promise<T> {
    const response = await api.post(this.endpoint, data)
    return response.data
  }

  // 수정
  async update(id: number, data: TUpdate): Promise<T> {
    const url = `${this.endpoint}${this.endpoint.endsWith('/') ? '' : '/'}${id}`
    const response = await api.put(url, data)
    return response.data
  }

  // 삭제
  async delete(id: number): Promise<void> {
    const url = `${this.endpoint}${this.endpoint.endsWith('/') ? '' : '/'}${id}`
    await api.delete(url)
  }
}

// API 에러 처리 헬퍼
export const handleApiError = (error: any): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail
  }
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return '알 수 없는 오류가 발생했습니다.'
}