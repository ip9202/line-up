import api from '@/lib/api'
import { Game, GameCreate, GameUpdate } from '../types'

// 경기 목록 조회
export const getGames = async (params?: {
  skip?: number
  limit?: number
  status?: string
}): Promise<Game[]> => {
  const response = await api.get('/games/', { params })
  return response.data
}

// 경기 상세 조회
export const getGame = async (id: number): Promise<Game> => {
  const response = await api.get(`/games/${id}`)
  return response.data
}

// 경기 생성
export const createGame = async (game: GameCreate): Promise<Game> => {
  const response = await api.post('/games/', game)
  return response.data
}

// 경기 수정
export const updateGame = async (id: number, game: GameUpdate): Promise<Game> => {
  const response = await api.put(`/games/${id}`, game)
  return response.data
}

// 경기 삭제
export const deleteGame = async (id: number): Promise<void> => {
  await api.delete(`/games/${id}`)
}

// 경기의 라인업 개수 조회
export const getGameLineupsCount = async (id: number): Promise<{ lineups_count: number }> => {
  const response = await api.get(`/games/${id}/lineups/count`)
  return response.data
}
