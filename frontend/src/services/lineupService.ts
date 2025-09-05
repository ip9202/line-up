import api from '@/lib/api'
import { Lineup, LineupCreate, LineupUpdate, LineupPlayerCreate } from '../types'

// 라인업 목록 조회
export const getLineups = async (params?: {
  skip?: number
  limit?: number
  game_id?: number
}): Promise<Lineup[]> => {
  const response = await api.get('/lineups/', { params })
  return response.data
}

// 라인업 상세 조회
export const getLineup = async (id: number): Promise<Lineup> => {
  const response = await api.get(`/lineups/${id}`)
  return response.data
}

// 라인업 생성
export const createLineup = async (lineup: LineupCreate): Promise<Lineup> => {
  const response = await api.post('/lineups/', lineup)
  return response.data
}

// 라인업 수정
export const updateLineup = async (id: number, lineup: LineupUpdate): Promise<Lineup> => {
  const response = await api.put(`/lineups/${id}`, lineup)
  return response.data
}

// 라인업 삭제
export const deleteLineup = async (id: number): Promise<void> => {
  await api.delete(`/lineups/${id}`)
}

// 라인업에 선수 추가
export const addPlayerToLineup = async (lineupId: number, playerData: LineupPlayerCreate) => {
  const response = await api.post(`/lineups/${lineupId}/players`, playerData)
  return response.data
}

// 라인업에서 선수 제거
export const removePlayerFromLineup = async (lineupId: number, lineupPlayerId: number): Promise<void> => {
  await api.delete(`/lineups/${lineupId}/players/${lineupPlayerId}`)
}

// 라인업 복사
export const copyLineup = async (lineupId: number, newName: string, newGameId?: number): Promise<Lineup> => {
  const response = await api.post(`/lineups/${lineupId}/copy`, {
    new_name: newName,
    new_game_id: newGameId
  })
  return response.data
}
