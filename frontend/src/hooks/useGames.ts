import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getGames, getGame, createGame, updateGame, deleteGame } from '../services/gameService'
import { Game, GameCreate, GameUpdate } from '../types'

// 경기 목록 조회
export const useGames = (params?: {
  skip?: number
  limit?: number
  status?: string
}) => {
  return useQuery({
    queryKey: ['games', params],
    queryFn: () => getGames(params),
  })
}

// 경기 상세 조회
export const useGame = (id: number) => {
  return useQuery({
    queryKey: ['game', id],
    queryFn: () => getGame(id),
    enabled: !!id,
  })
}

// 경기 생성
export const useCreateGame = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (game: GameCreate) => createGame(game),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
  })
}

// 경기 수정
export const useUpdateGame = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, game }: { id: number; game: GameUpdate }) => 
      updateGame(id, game),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['game', variables.id] })
    },
  })
}

// 경기 삭제
export const useDeleteGame = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => deleteGame(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
  })
}
