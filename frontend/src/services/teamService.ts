import { BaseApiService } from './baseService'
import { Team, TeamCreate, TeamUpdate } from '../types'
import { API_ENDPOINTS } from '../constants'

// 팀 서비스 클래스
class TeamApiService extends BaseApiService<Team, TeamCreate, TeamUpdate> {
  constructor() {
    super(API_ENDPOINTS.TEAMS)
  }

  // 특정 조건으로 팀 조회 (확장 메서드)
  async getTeams(params?: {
    skip?: number
    limit?: number
    active?: boolean
    league?: string
  }): Promise<Team[]> {
    return this.getAll(params)
  }
}

// 서비스 인스턴스 생성
const teamService = new TeamApiService()

// 기존 함수형 인터페이스 유지 (하위 호환성)
export const getTeams = (params?: {
  skip?: number
  limit?: number
  active?: boolean
  league?: string
}) => teamService.getTeams(params)

export const getTeam = (id: number) => teamService.getById(id)
export const createTeam = (team: TeamCreate) => teamService.create(team)
export const updateTeam = (id: number, team: TeamUpdate) => teamService.update(id, team)
export const deleteTeam = (id: number) => teamService.delete(id)

export default teamService
