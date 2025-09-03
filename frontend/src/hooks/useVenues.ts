import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { venueService } from '../services/venueService'
import { Venue, VenueCreate, VenueUpdate } from '../types'

// 경기장 목록 조회
export const useVenues = (params?: {
  skip?: number
  limit?: number
  active?: boolean
}) => {
  return useQuery({
    queryKey: ['venues', params],
    queryFn: () => venueService.getVenues(params),
  })
}

// 경기장 상세 조회
export const useVenue = (id: number) => {
  return useQuery({
    queryKey: ['venue', id],
    queryFn: () => venueService.getVenue(id),
    enabled: !!id,
  })
}

// 경기장 생성
export const useCreateVenue = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (venue: VenueCreate) => venueService.createVenue(venue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
  })
}

// 경기장 수정
export const useUpdateVenue = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, venue }: { id: number; venue: VenueUpdate }) => 
      venueService.updateVenue(id, venue),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      queryClient.invalidateQueries({ queryKey: ['venue', variables.id] })
    },
  })
}

// 경기장 삭제
export const useDeleteVenue = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => venueService.deleteVenue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] })
    },
  })
}
