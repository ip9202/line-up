import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teamService } from '../services/teamService'
import { Team, TeamCreate, TeamUpdate } from '../types'

// 팀 목록 조회
export const useTeams = (params?: {
  skip?: number
  limit?: number
  active?: boolean
  league?: string
}) => {
  return useQuery({
    queryKey: ['teams', params],
    queryFn: () => teamService.getTeams(params),
    staleTime: 5 * 60 * 1000, // 5분
  })
}

// 팀 상세 조회
export const useTeam = (id: number) => {
  return useQuery({
    queryKey: ['team', id],
    queryFn: () => teamService.getById(id),
    enabled: !!id,
  })
}

// 팀 생성
export const useCreateTeam = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (team: TeamCreate) => teamService.create(team),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}

// 팀 수정
export const useUpdateTeam = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, team }: { id: number; team: TeamUpdate }) =>
      teamService.update(id, team),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      queryClient.invalidateQueries({ queryKey: ['team', data.id] })
    },
  })
}

// 팀 삭제
export const useDeleteTeam = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => teamService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}
