import api from '../lib/api'
import { Team, TeamCreate, TeamUpdate } from '../types'
import { API_ENDPOINTS } from '../constants'

const API_BASE_URL = API_ENDPOINTS.TEAMS

export const teamService = {
  // 팀 목록 조회
  getTeams: async (params?: {
    skip?: number
    limit?: number
    active?: boolean
    league?: string
  }): Promise<Team[]> => {
    const searchParams = new URLSearchParams()
    if (params?.skip) searchParams.append('skip', params.skip.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.active !== undefined) searchParams.append('active', params.active.toString())
    if (params?.league) searchParams.append('league', params.league)

    const url = searchParams.toString() ? `${API_BASE_URL}?${searchParams}` : API_BASE_URL
    const response = await api.get(url)
    return response.data
  },

  // 팀 상세 조회
  getTeam: async (id: number): Promise<Team> => {
    const response = await api.get(`${API_BASE_URL}/${id}`)
    return response.data
  },

  // 팀 생성
  createTeam: async (team: TeamCreate): Promise<Team> => {
    console.log('팀 생성 요청 데이터:', team)
    const response = await api.post(API_BASE_URL, team, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  },

  // 팀 수정
  updateTeam: async (id: number, team: TeamUpdate): Promise<Team> => {
    const response = await api.put(`${API_BASE_URL}/${id}`, team)
    return response.data
  },

  // 팀 삭제
  deleteTeam: async (id: number): Promise<void> => {
    await api.delete(`${API_BASE_URL}/${id}`)
  }
}
