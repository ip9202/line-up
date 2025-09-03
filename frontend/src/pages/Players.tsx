import { useState } from 'react'
import { Plus, Search, Filter, Users, Edit, Trash2, Eye, X, ChevronUp, ChevronDown } from 'lucide-react'
import { usePlayers, useDeletePlayer } from '../hooks/usePlayers'
import { Player, PlayerRole } from '../types'
import PlayerForm from '../components/PlayerForm'
import { useAuth } from '../contexts/AuthContext'

export default function Players() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null)
  
  // 정렬 상태
  const [sortField, setSortField] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // 인증 상태
  const { user, isAuthenticated } = useAuth()

  // API 호출
  const { data: players, isLoading, error } = usePlayers({
    role: selectedRole || undefined
  })
  const deletePlayerMutation = useDeletePlayer()

  // 권한 체크 함수들
  const canManagePlayers = () => {
    return isAuthenticated && user?.role === '총무'
  }

  const canEditPlayer = () => {
    return isAuthenticated && user?.role === '총무'
  }

  const canDeletePlayer = () => {
    return isAuthenticated && user?.role === '총무'
  }

  // 정렬 함수
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // 정렬 함수
  const sortPlayers = (players: Player[], field: string, direction: 'asc' | 'desc') => {
    return [...players].sort((a, b) => {
      let aValue: any = a[field as keyof Player]
      let bValue: any = b[field as keyof Player]

      // null/undefined 처리
      if (aValue === null || aValue === undefined) aValue = ''
      if (bValue === null || bValue === undefined) bValue = ''

      // 숫자 필드 처리
      if (field === 'number' || field === 'age') {
        aValue = aValue || 0
        bValue = bValue || 0
        return direction === 'asc' ? aValue - bValue : bValue - aValue
      }

      // 문자열 필드 처리
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc' 
          ? aValue.localeCompare(bValue, 'ko-KR')
          : bValue.localeCompare(aValue, 'ko-KR')
      }

      // 불린 필드 처리
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return direction === 'asc' 
          ? (aValue === bValue ? 0 : aValue ? 1 : -1)
          : (aValue === bValue ? 0 : aValue ? -1 : 1)
      }

      return 0
    })
  }

  // 필터링 및 정렬된 선수 목록
  const filteredPlayers = players?.filter(player => 
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const sortedPlayers = sortField 
    ? sortPlayers(filteredPlayers, sortField, sortDirection)
    : filteredPlayers

  // 선수 삭제 핸들러
  const handleDelete = async (id: number) => {
    if (window.confirm('정말로 이 선수를 삭제하시겠습니까?')) {
      try {
        await deletePlayerMutation.mutateAsync(id)
        alert('선수가 삭제되었습니다.')
      } catch (error) {
        alert('선수 삭제에 실패했습니다.')
      }
    }
  }

  // 선수 수정 핸들러
  const handleEdit = (player: Player) => {
    setEditingPlayer(player)
    setShowForm(true)
  }

  // 선수 상세보기 핸들러
  const handleView = (player: Player) => {
    setViewingPlayer(player)
  }

  // 폼 닫기 핸들러
  const handleCloseForm = () => {
    setShowForm(false)
    setEditingPlayer(null)
    setViewingPlayer(null)
  }

  // 정렬 가능한 헤더 컴포넌트
  const SortableHeader = ({ field, children }: { field: string, children: React.ReactNode }) => {
    const isActive = sortField === field
    const isAsc = isActive && sortDirection === 'asc'
    const isDesc = isActive && sortDirection === 'desc'

    return (
      <th 
        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center gap-1">
          <span>{children}</span>
          <div className="flex flex-col">
            <ChevronUp 
              className={`h-3 w-3 ${isAsc ? 'text-blue-600' : 'text-gray-400'}`} 
            />
            <ChevronDown 
              className={`h-3 w-3 -mt-1 ${isDesc ? 'text-blue-600' : 'text-gray-400'}`} 
            />
          </div>
        </div>
      </th>
    )
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">선수 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <Users className="mx-auto h-12 w-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
        <p className="text-gray-500">선수 목록을 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              선수 관리
            </h1>
            <p className="mt-2 text-gray-600">
              팀 선수들의 정보를 관리하고 라인업에 활용하세요.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {sortedPlayers.length}
            </div>
            <div className="text-sm text-gray-500">총 선수</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="선수 이름으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white min-w-[140px]"
            >
              <option value="">모든 역할</option>
              <option value="선수">선수</option>
              <option value="감독">감독</option>
              <option value="코치">코치</option>
              <option value="총무">총무</option>
              <option value="회장">회장</option>
              <option value="고문">고문</option>
            </select>
          </div>
                    <button
            onClick={() => setShowForm(true)}
            disabled={!canManagePlayers()}
            className={`inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors shadow-sm ${
              canManagePlayers()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Plus className="h-5 w-5 mr-2" />
            선수 추가
          </button>
        </div>
      </div>

      {/* Players Table */}
      {sortedPlayers.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <SortableHeader field="number">등번호</SortableHeader>
                  <SortableHeader field="name">이름</SortableHeader>
                  <SortableHeader field="role">역할</SortableHeader>
                  <SortableHeader field="age">나이</SortableHeader>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">출신지</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">학교</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">선호포지션</th>
                  <SortableHeader field="is_professional">선수출신</SortableHeader>
                  <SortableHeader field="is_active">상태</SortableHeader>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">작업</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPlayers.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-sm">
                          {player.number || '?'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{player.name}</div>
                          {player.phone && (
                            <div className="text-sm text-gray-500">
                              {player.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        player.role === '선수' ? 'bg-blue-100 text-blue-800' :
                        player.role === '감독' ? 'bg-purple-100 text-purple-800' :
                        player.role === '코치' ? 'bg-green-100 text-green-800' :
                        player.role === '총무' ? 'bg-yellow-100 text-yellow-800' :
                        player.role === '회장' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {player.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.age ? `${player.age}세` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.hometown || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.school || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {player.position_preference ? (
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {player.position_preference}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        player.is_professional 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {player.is_professional ? '선수출신' : '비선수출신'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        player.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {player.is_active ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => handleView(player)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                          title="상세보기"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canEditPlayer() && (
                          <button 
                            onClick={() => handleEdit(player)}
                            className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-green-50 transition-colors"
                            title="수정"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {canDeletePlayer() && (
                          <button 
                            onClick={() => handleDelete(player.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || selectedRole ? '검색 결과가 없습니다' : '선수가 없습니다'}
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {searchTerm || selectedRole 
                ? '다른 검색어나 필터를 시도해보세요.' 
                : '첫 번째 선수를 추가하여 팀을 구성해보세요.'
              }
            </p>
            {!searchTerm && !selectedRole && (
                            <button
                onClick={() => setShowForm(true)}
                disabled={!canManagePlayers()}
                className={`inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors shadow-sm ${
                  canManagePlayers()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus className="h-5 w-5 mr-2" />
                첫 번째 선수 추가
              </button>
            )}
          </div>
        </div>
      )}

      {/* Player Form Modal */}
      {showForm && (
        <PlayerForm
          player={editingPlayer}
          onClose={handleCloseForm}
        />
      )}

      {/* Player Detail Modal */}
      {viewingPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {viewingPlayer.number || '?'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{viewingPlayer.name}</h2>
                    <p className="text-blue-100 text-sm">
                      {viewingPlayer.role} • {viewingPlayer.position_preference || '포지션 미정'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseForm}
                  className="text-white hover:text-blue-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-full"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">이름</label>
                    <p className="text-lg font-medium text-gray-900">{viewingPlayer.name}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">역할</label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      viewingPlayer.role === '선수' ? 'bg-blue-100 text-blue-800' :
                      viewingPlayer.role === '감독' ? 'bg-purple-100 text-purple-800' :
                      viewingPlayer.role === '코치' ? 'bg-green-100 text-green-800' :
                      viewingPlayer.role === '총무' ? 'bg-yellow-100 text-yellow-800' :
                      viewingPlayer.role === '회장' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {viewingPlayer.role}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">출신지</label>
                    <p className="text-gray-900">{viewingPlayer.hometown || '-'}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">선호포지션</label>
                    {viewingPlayer.position_preference ? (
                      <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {viewingPlayer.position_preference}
                      </span>
                    ) : (
                      <p className="text-gray-500">-</p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">전화번호</label>
                    <p className="text-gray-900">
                      {viewingPlayer.phone 
                        ? viewingPlayer.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
                        : '-'
                      }
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">신장</label>
                    <p className="text-gray-900">{viewingPlayer.height ? `${viewingPlayer.height}cm` : '-'}</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">등번호</label>
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {viewingPlayer.number || '?'}
                      </span>
                      <span className="text-lg font-medium text-gray-900">
                        {viewingPlayer.number || '미배정'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">나이</label>
                    <p className="text-gray-900">{viewingPlayer.age ? `${viewingPlayer.age}세` : '-'}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">학교</label>
                    <p className="text-gray-900">{viewingPlayer.school || '-'}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">선수출신 여부</label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      viewingPlayer.is_professional 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {viewingPlayer.is_professional ? '선수출신' : '비선수출신'}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">상태</label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      viewingPlayer.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {viewingPlayer.is_active ? '활성' : '비활성'}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">이메일</label>
                    <p className="text-gray-900 break-all">{viewingPlayer.email || '-'}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-2">체중</label>
                    <p className="text-gray-900">{viewingPlayer.weight ? `${viewingPlayer.weight}kg` : '-'}</p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {(viewingPlayer.birth_date || viewingPlayer.join_date) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {viewingPlayer.birth_date && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-semibold text-gray-600 mb-2">생년월일</label>
                      <p className="text-gray-900">{new Date(viewingPlayer.birth_date).toLocaleDateString('ko-KR')}</p>
                    </div>
                  )}
                  {viewingPlayer.join_date && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="block text-sm font-semibold text-gray-600 mb-2">입단일</label>
                      <p className="text-gray-900">{new Date(viewingPlayer.join_date).toLocaleDateString('ko-KR')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {viewingPlayer.notes && (
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <label className="block text-sm font-semibold text-blue-800 mb-2">메모</label>
                  <p className="text-blue-900 leading-relaxed">{viewingPlayer.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCloseForm}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  닫기
                </button>
                {canEditPlayer() && (
                  <button
                    onClick={() => {
                      setEditingPlayer(viewingPlayer)
                      setViewingPlayer(null)
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    수정
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
