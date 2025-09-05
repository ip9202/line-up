import { Player, PlayerCreate, PlayerUpdate } from '../types'
import { BaseApiService } from './baseService'
import { API_ENDPOINTS } from '../constants'

// 플레이어 서비스 클래스
class PlayerApiService extends BaseApiService<Player, PlayerCreate, PlayerUpdate> {
  constructor() {
    super(API_ENDPOINTS.PLAYERS)
  }

  // 특정 조건으로 선수 조회 (확장 메서드)
  async getPlayersByRole(role: string): Promise<Player[]> {
    return this.getAll({ role })
  }

  // 활성 선수만 조회
  async getActivePlayers(): Promise<Player[]> {
    return this.getAll({ active: true })
  }
}

// 서비스 인스턴스 생성
const playerService = new PlayerApiService()

// 기존 함수형 인터페이스 유지 (하위 호환성)
export const getPlayers = (params?: {
  skip?: number
  limit?: number
  active?: boolean
  role?: string
}) => playerService.getAll(params)

export const getPlayer = (id: number) => playerService.getById(id)
export const createPlayer = (player: PlayerCreate) => playerService.create(player)
export const updatePlayer = (id: number, player: PlayerUpdate) => playerService.update(id, player)
export const deletePlayer = (id: number) => playerService.delete(id)

// 새로운 메서드들
export const getPlayersByRole = (role: string) => playerService.getPlayersByRole(role)
export const getActivePlayers = () => playerService.getActivePlayers()

export default playerService
