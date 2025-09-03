import { useState } from 'react'
import { Plus, Search, Edit, Trash2, MapPin, Users, Calendar, Building } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useVenues, useCreateVenue, useUpdateVenue, useDeleteVenue } from '../hooks/useVenues'
import { Venue } from '../types'
import VenueForm from '../components/VenueForm'

export default function Venues() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null)
  
  // 인증 상태
  const { user, isAuthenticated } = useAuth()

  // API hooks
  const { data: venues = [], isLoading, error } = useVenues({ active: true })
  const createVenueMutation = useCreateVenue()
  const updateVenueMutation = useUpdateVenue()
  const deleteVenueMutation = useDeleteVenue()

  console.log('Venues 컴포넌트 렌더링:', { venues, isLoading, error })
  console.log('venues 데이터 상세:', venues)

  // 권한 체크 함수들
  const canManageVenues = () => {
    return isAuthenticated && user?.role === '총무'
  }

  const canEditVenue = () => {
    return isAuthenticated && user?.role === '총무'
  }

  const canDeleteVenue = () => {
    return isAuthenticated && user?.role === '총무'
  }

  // 필터링된 경기장 목록
  const filteredVenues = venues.filter(venue => 
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.surface_type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  console.log('필터링 결과:', { venues, filteredVenues, searchTerm })

  // 이벤트 핸들러들
  const handleAddVenue = () => {
    setEditingVenue(null)
    setIsFormOpen(true)
  }

  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue)
    setIsFormOpen(true)
  }

  const handleDeleteVenue = async (venue: Venue) => {
    if (window.confirm(`"${venue.name}" 경기장을 삭제하시겠습니까?`)) {
      try {
        await deleteVenueMutation.mutateAsync(venue.id)
      } catch (error: any) {
        console.error('경기장 삭제 실패:', error)
        const errorMessage = error?.response?.data?.detail || '경기장 삭제에 실패했습니다.'
        alert(errorMessage)
      }
    }
  }

  const handleFormSubmit = async (venueData: any) => {
    try {
      if (editingVenue) {
        // 수정
        await updateVenueMutation.mutateAsync({ id: editingVenue.id, venue: venueData })
      } else {
        // 생성
        await createVenueMutation.mutateAsync(venueData)
      }
      setIsFormOpen(false)
      setEditingVenue(null)
    } catch (error) {
      console.error('경기장 저장 실패:', error)
      alert('경기장 저장에 실패했습니다.')
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingVenue(null)
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">경기장 관리</h1>
        <p className="page-subtitle">
          경기장 정보를 관리하고 경기 일정에 활용하세요.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="경기장명, 위치, 표면타입으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        </div>
        <button 
          onClick={handleAddVenue}
          disabled={!canManageVenues()}
          className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors ${
            canManageVenues()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus className="h-4 w-4" />
          경기장 추가
        </button>
      </div>

      {/* Venues List */}
      {(() => {
        console.log('렌더링 조건 체크:', { isLoading, error, filteredVenuesLength: filteredVenues.length })
        return null
      })()}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">경기장 목록을 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">경기장 목록을 불러오는데 실패했습니다.</p>
          <p className="text-sm text-gray-500 mt-2">{error.message}</p>
        </div>
      ) : filteredVenues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {console.log('카드 렌더링 시작:', filteredVenues)}
          {filteredVenues.map((venue) => {
            console.log('개별 venue 렌더링:', venue)
            return (
            <div key={venue.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {venue.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      venue.is_active 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {venue.is_active ? '활성' : '비활성'}
                    </span>
                    {venue.is_indoor && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        실내
                      </span>
                    )}
                  </div>
                </div>
              </div>
                
              <div className="space-y-3">
                {venue.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="font-medium">{venue.location}</span>
                  </div>
                )}
                {venue.capacity && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2 text-green-500" />
                    <span className="font-medium">{venue.capacity.toLocaleString()}명</span>
                  </div>
                )}
                {venue.surface_type && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="h-4 w-4 mr-2 text-yellow-500" />
                    <span className="font-medium">{venue.surface_type}</span>
                  </div>
                )}
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  등록일: {new Date(venue.created_at).toLocaleDateString('ko-KR')}
                </div>
              </div>
                
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex gap-2">
                  {canEditVenue() && (
                    <button 
                      onClick={() => handleEditVenue(venue)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      수정
                    </button>
                  )}
                  {canDeleteVenue() && (
                    <button 
                      onClick={() => handleDeleteVenue(venue)}
                      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      삭제
                    </button>
                  )}
                </div>
              </div>
            </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? '검색 결과가 없습니다' : '등록된 경기장이 없습니다'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? '다른 검색어를 시도해보세요.' : '첫 번째 경기장을 추가해보세요.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button 
                onClick={handleAddVenue}
                disabled={!canManageVenues()}
                className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors ${
                  canManageVenues()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus className="h-4 w-4" />
                경기장 추가
              </button>
            </div>
          )}
        </div>
      )}

      {/* Venue Form Modal */}
      <VenueForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        venue={editingVenue}
        isLoading={createVenueMutation.isPending || updateVenueMutation.isPending}
      />
    </div>
  )
}
