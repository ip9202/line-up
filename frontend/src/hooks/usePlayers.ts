import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPlayers, getPlayer, createPlayer, updatePlayer, deletePlayer } from '../services/playerService'
import { Player, PlayerCreate, PlayerUpdate } from '../types'

// 선수 목록 조회
export const usePlayers = (params?: {
  skip?: number
  limit?: number
  active?: boolean
  role?: string
}) => {
  return useQuery({
    queryKey: ['players', params],
    queryFn: () => getPlayers(params),
  })
}

// 선수 상세 조회
export const usePlayer = (id: number) => {
  return useQuery({
    queryKey: ['player', id],
    queryFn: () => getPlayer(id),
    enabled: !!id,
  })
}

// 선수 생성
export const useCreatePlayer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (player: PlayerCreate) => createPlayer(player),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
    },
  })
}

// 선수 수정
export const useUpdatePlayer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, player }: { id: number; player: PlayerUpdate }) => 
      updatePlayer(id, player),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      queryClient.invalidateQueries({ queryKey: ['player', variables.id] })
    },
  })
}

// 선수 삭제
export const useDeletePlayer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => deletePlayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
    },
  })
}
