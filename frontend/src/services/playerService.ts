import api from '@/lib/api'
import { Player, PlayerCreate, PlayerUpdate } from '../types'

// 선수 목록 조회
export const getPlayers = async (params?: {
  skip?: number
  limit?: number
  active?: boolean
  role?: string
}): Promise<Player[]> => {
  const response = await api.get('/players/', { params })
  return response.data
}

// 선수 상세 조회
export const getPlayer = async (id: number): Promise<Player> => {
  const response = await api.get(`/players/${id}`)
  return response.data
}

// 선수 생성
export const createPlayer = async (player: PlayerCreate): Promise<Player> => {
  const response = await api.post('/players/', player)
  return response.data
}

// 선수 수정
export const updatePlayer = async (id: number, player: PlayerUpdate): Promise<Player> => {
  const response = await api.put(`/players/${id}`, player)
  return response.data
}

// 선수 삭제
export const deletePlayer = async (id: number): Promise<void> => {
  await api.delete(`/players/${id}`)
}
