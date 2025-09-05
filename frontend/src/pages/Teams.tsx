import { useState } from 'react'
import { Plus, Search, Edit, Trash2, MapPin, Trophy, Users, Calendar } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTeams, useDeleteTeam } from '../hooks/useTeams'
import { Team } from '../types'
import TeamForm from '../components/TeamForm'

export default function Teams() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  // 인증 상태
  const { user, isAuthenticated } = useAuth()

  // 데이터 조회
  const { data: teams = [], isLoading } = useTeams({ active: true })
  const deleteTeamMutation = useDeleteTeam()

  // 권한 체크 함수들
  const canManageTeams = () => {
    return isAuthenticated && user?.role === '총무'
  }

  const canEditTeam = () => {
    return isAuthenticated && user?.role === '총무'
  }

  const canDeleteTeam = () => {
    return isAuthenticated && user?.role === '총무'
  }

  // 검색 필터링 및 정렬
  const filteredTeams = teams
    .filter(team =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.city && team.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (team.league && team.league.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      // 우리팀을 제일 앞으로 정렬
      if (a.is_our_team && !b.is_our_team) return -1
      if (!a.is_our_team && b.is_our_team) return 1
      // 그 외는 이름순 정렬
      return a.name.localeCompare(b.name)
    })

  // 핸들러 함수들
  const handleAddTeam = () => {
    setSelectedTeam(null)
    setIsEditMode(false)
    setIsFormOpen(true)
  }

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team)
    setIsEditMode(true)
    setIsFormOpen(true)
  }

  const handleDeleteTeam = async (team: Team) => {
    console.log('팀 삭제 시도:', { team: team.name, isAuthenticated, user: user?.role })
    console.log('토큰 확인:', localStorage.getItem('auth_token'))
    
    if (window.confirm(`"${team.name}" 팀을 삭제하시겠습니까?`)) {
      try {
        await deleteTeamMutation.mutateAsync(team.id)
      } catch (error: any) {
        console.error('팀 삭제 실패:', error)
        console.error('에러 상세:', error.response?.data)
        
        // 연결된 데이터가 있는 경우의 에러 처리
        if (error.response?.status === 400) {
          const errorMessage = error.response.data.detail
          if (errorMessage.includes('연결된 경기')) {
            alert('연결된 경기가 있습니다. 먼저 경기를 삭제해 주세요.')
          } else if (errorMessage.includes('소속된 선수')) {
            alert('소속된 선수가 있습니다. 선수 관리에서 팀을 변경하거나 선수를 삭제해 주세요.')
          } else {
            alert(errorMessage)
          }
        } else if (error.response?.status === 401) {
          alert('인증이 필요합니다. 다시 로그인해 주세요.')
        } else {
          alert('팀 삭제에 실패했습니다.')
        }
      }
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setSelectedTeam(null)
    setIsEditMode(false)
  }

  if (isLoading) {
    return <div className="loading">로딩 중...</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              팀 관리
            </h1>
            <p className="mt-2 text-gray-600">
              상대팀 정보를 관리하고 경기 일정에 활용하세요.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {filteredTeams.length}
            </div>
            <div className="text-sm text-gray-500">총 팀</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="팀명, 도시, 리그로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        </div>
        <button 
          onClick={handleAddTeam}
          disabled={!canManageTeams()}
          className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors ${
            canManageTeams()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus className="h-4 w-4" />
          팀 추가
        </button>
      </div>

      {/* Teams List */}
      {filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div key={team.id} className={`rounded-xl border p-6 hover:shadow-lg transition-all duration-200 group ${
              team.is_our_team 
                ? 'bg-blue-50 border-blue-200 hover:border-blue-400 hover:shadow-blue-100' 
                : 'bg-white border-gray-200 hover:border-blue-300'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {team.name}
                    </h3>
                    {team.is_our_team && (
                      <span className="px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded-full shadow-sm">
                        우리팀
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      team.is_active 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {team.is_active ? '활성 팀' : '비활성'}
                    </span>
                  </div>
                </div>
              </div>
                
                <div className="space-y-3">
                  {team.city && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="font-medium">{team.city}</span>
                    </div>
                  )}
                  {team.league && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                      <span className="font-medium">{team.league}</span>
                    </div>
                  )}
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    등록일: {new Date(team.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    {canEditTeam() && (
                      <button 
                        onClick={() => handleEditTeam(team)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        수정
                      </button>
                    )}
                    {canDeleteTeam() && (
                      <button 
                        onClick={() => handleDeleteTeam(team)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        삭제
                      </button>
                    )}
                  </div>
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? '검색 결과가 없습니다' : '등록된 팀이 없습니다'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? '다른 검색어를 시도해보세요.' 
              : '첫 번째 팀을 추가해보세요.'
            }
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button 
                onClick={handleAddTeam}
                disabled={!canManageTeams()}
                className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors ${
                  canManageTeams()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus className="h-4 w-4" />
                팀 추가
              </button>
            </div>
          )}
        </div>
      )}

      {/* Team Form Modal */}
      {isFormOpen && (
        <TeamForm
          team={selectedTeam}
          isEditMode={isEditMode}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}
