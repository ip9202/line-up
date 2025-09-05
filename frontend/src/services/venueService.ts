import api from '../lib/api'
import { Venue, VenueCreate, VenueUpdate } from '../types'

const API_BASE_URL = '/venues'

export const venueService = {
  // 경기장 목록 조회
  getVenues: async (params?: {
    skip?: number
    limit?: number
    active?: boolean
  }): Promise<Venue[]> => {
    console.log('venueService.getVenues 시작:', params)
    const searchParams = new URLSearchParams()
    if (params?.skip) searchParams.append('skip', params.skip.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.active !== undefined) searchParams.append('active', params.active.toString())

    const url = searchParams.toString() ? `${API_BASE_URL}/?${searchParams}` : API_BASE_URL
    console.log('venueService.getVenues URL:', url)
    const response = await api.get(url)
    console.log('venueService.getVenues 응답:', response.data)
    return response.data
  },

  // 경기장 상세 조회
  getVenue: async (id: number): Promise<Venue> => {
    const response = await api.get(`${API_BASE_URL}/${id}`)
    return response.data
  },

  // 경기장 생성
  createVenue: async (venue: VenueCreate): Promise<Venue> => {
    const response = await api.post(API_BASE_URL, venue)
    return response.data
  },

  // 경기장 수정
  updateVenue: async (id: number, venue: VenueUpdate): Promise<Venue> => {
    const response = await api.put(`${API_BASE_URL}/${id}`, venue)
    return response.data
  },

  // 경기장 삭제
  deleteVenue: async (id: number): Promise<void> => {
    await api.delete(`${API_BASE_URL}/${id}`)
  }
}
