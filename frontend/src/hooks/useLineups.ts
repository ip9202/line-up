import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getLineups, 
  getLineup, 
  createLineup, 
  updateLineup, 
  deleteLineup,
  addPlayerToLineup,
  removePlayerFromLineup,
  copyLineup
} from '../services/lineupService'
import { Lineup, LineupCreate, LineupUpdate, LineupPlayerCreate } from '../types'

// 라인업 목록 조회
export const useLineups = (params?: {
  skip?: number
  limit?: number
  game_id?: number
}) => {
  return useQuery({
    queryKey: ['lineups', params],
    queryFn: () => getLineups(params),
  })
}

// 라인업 상세 조회
export const useLineup = (id: number) => {
  return useQuery({
    queryKey: ['lineup', id],
    queryFn: () => getLineup(id),
    enabled: !!id,
  })
}

// 라인업 생성
export const useCreateLineup = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (lineup: LineupCreate) => createLineup(lineup),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lineups'] })
    },
  })
}

// 라인업 수정
export const useUpdateLineup = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, lineup }: { id: number; lineup: LineupUpdate }) => 
      updateLineup(id, lineup),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lineups'] })
      queryClient.invalidateQueries({ queryKey: ['lineup', variables.id] })
    },
  })
}

// 라인업 삭제
export const useDeleteLineup = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => deleteLineup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lineups'] })
    },
  })
}

// 라인업에 선수 추가
export const useAddPlayerToLineup = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ lineupId, playerData }: { lineupId: number; playerData: LineupPlayerCreate }) => 
      addPlayerToLineup(lineupId, playerData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lineups'] })
      queryClient.invalidateQueries({ queryKey: ['lineup', variables.lineupId] })
    },
  })
}

// 라인업에서 선수 제거
export const useRemovePlayerFromLineup = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ lineupId, lineupPlayerId }: { lineupId: number; lineupPlayerId: number }) => 
      removePlayerFromLineup(lineupId, lineupPlayerId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lineups'] })
      queryClient.invalidateQueries({ queryKey: ['lineup', variables.lineupId] })
    },
  })
}

// 라인업 복사
export const useCopyLineup = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ lineupId, newName, newGameId }: { lineupId: number; newName: string; newGameId?: number }) => 
      copyLineup(lineupId, newName, newGameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lineups'] })
    },
  })
}
