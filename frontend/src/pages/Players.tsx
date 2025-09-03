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
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <SortableHeader field="number">등번호</SortableHeader>
                    <SortableHeader field="name">이름</SortableHeader>
                    <SortableHeader field="role">역할</SortableHeader>
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

          {/* Mobile List */}
          <div className="lg:hidden space-y-3">
            {sortedPlayers.map((player) => (
              <div key={player.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  {/* Player Info */}
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {player.number || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-lg font-semibold text-gray-900 truncate">{player.name}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          player.role === '선수' ? 'bg-blue-100 text-blue-800' :
                          player.role === '감독' ? 'bg-purple-100 text-purple-800' :
                          player.role === '코치' ? 'bg-green-100 text-green-800' :
                          player.role === '총무' ? 'bg-yellow-100 text-yellow-800' :
                          player.role === '회장' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {player.role}
                        </span>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          player.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {player.is_active ? '활성' : '비활성'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button 
                      onClick={() => handleView(player)}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                      title="상세보기"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    {canEditPlayer() && (
                      <button 
                        onClick={() => handleEdit(player)}
                        className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                        title="수정"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    )}
                    {canDeletePlayer() && (
                      <button 
                        onClick={() => handleDelete(player.id)}
                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white rounded-t-2xl overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
              </div>
              
              <div className="relative p-5">
                <div className="flex justify-between items-start mb-4">
                  <button
                    onClick={handleCloseForm}
                    className="text-white hover:text-blue-200 transition-all duration-200 p-2 hover:bg-white hover:bg-opacity-10 rounded-full backdrop-blur-sm"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-end gap-5">
                  {/* Profile Avatar */}
                  <div className="relative">
                    <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm border-3 border-white border-opacity-30 shadow-xl">
                      <span className="text-2xl font-black text-white">
                        {viewingPlayer.number || '?'}
                      </span>
                    </div>
                    {/* Status Badge */}
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                      viewingPlayer.is_active ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        viewingPlayer.is_active ? 'bg-green-300' : 'bg-red-300'
                      }`}></div>
                    </div>
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl font-black mb-1 tracking-tight">
                      {viewingPlayer.name}
                    </h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                        viewingPlayer.role === '선수' ? 'bg-blue-500 bg-opacity-80 text-white' :
                        viewingPlayer.role === '감독' ? 'bg-purple-500 bg-opacity-80 text-white' :
                        viewingPlayer.role === '코치' ? 'bg-green-500 bg-opacity-80 text-white' :
                        viewingPlayer.role === '총무' ? 'bg-yellow-500 bg-opacity-80 text-white' :
                        viewingPlayer.role === '회장' ? 'bg-red-500 bg-opacity-80 text-white' :
                        'bg-gray-500 bg-opacity-80 text-white'
                      }`}>
                        {viewingPlayer.role}
                      </span>
                      {viewingPlayer.position_preference && (
                        <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-bold backdrop-blur-sm">
                          {viewingPlayer.position_preference}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm ${
                        viewingPlayer.is_professional
                          ? 'bg-emerald-500 bg-opacity-80 text-white'
                          : 'bg-slate-500 bg-opacity-80 text-white'
                      }`}>
                        {viewingPlayer.is_professional ? '선수출신' : '비선수출신'}
                      </span>
                    </div>
                    <p className="text-blue-100 text-sm">
                      등번호 {viewingPlayer.number || '미배정'} • 
                      {viewingPlayer.height && ` ${viewingPlayer.height}cm`}
                      {viewingPlayer.weight && ` • ${viewingPlayer.weight}kg`}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="p-5">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Main Info Card */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Contact Info */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      연락처 정보
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">📱</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">전화번호</p>
                          <p className="font-semibold text-gray-800 text-sm">
                            {viewingPlayer.phone 
                              ? viewingPlayer.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
                              : '미등록'
                            }
                          </p>
                        </div>
                      </div>
                      {viewingPlayer.email && (
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-bold text-sm">✉️</span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">이메일</p>
                            <p className="font-semibold text-gray-800 text-sm">{viewingPlayer.email}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Physical Stats */}
                  {(viewingPlayer.height || viewingPlayer.weight) && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-100 rounded-xl p-4 border border-emerald-200">
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        신체 정보
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {viewingPlayer.height && (
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                              <span className="text-emerald-600 font-bold text-sm">📏</span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">신장</p>
                              <p className="font-semibold text-gray-800 text-sm">{viewingPlayer.height}cm</p>
                            </div>
                          </div>
                        )}
                        {viewingPlayer.weight && (
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                              <span className="text-emerald-600 font-bold text-sm">⚖️</span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">체중</p>
                              <p className="font-semibold text-gray-800 text-sm">{viewingPlayer.weight}kg</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Background Info */}
                  {(viewingPlayer.hometown || viewingPlayer.school || viewingPlayer.age) && (
                    <div className="bg-gradient-to-r from-orange-50 to-red-100 rounded-xl p-4 border border-orange-200">
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                        배경 정보
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {viewingPlayer.hometown && (
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 font-bold text-sm">🏠</span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">출신지</p>
                              <p className="font-semibold text-gray-800 text-sm">{viewingPlayer.hometown}</p>
                            </div>
                          </div>
                        )}
                        {viewingPlayer.school && (
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 font-bold text-sm">🎓</span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">학교</p>
                              <p className="font-semibold text-gray-800 text-sm">{viewingPlayer.school}</p>
                            </div>
                          </div>
                        )}
                        {viewingPlayer.age && (
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 font-bold text-sm">🎂</span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">나이</p>
                              <p className="font-semibold text-gray-800 text-sm">{viewingPlayer.age}세</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  {(viewingPlayer.birth_date || viewingPlayer.join_date || viewingPlayer.notes) && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-100 rounded-xl p-4 border border-purple-200">
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        추가 정보
                      </h3>
                      <div className="space-y-3">
                        {viewingPlayer.birth_date && (
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-bold text-sm">📅</span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">생년월일</p>
                              <p className="font-semibold text-gray-800 text-sm">
                                {new Date(viewingPlayer.birth_date).toLocaleDateString('ko-KR')}
                              </p>
                            </div>
                          </div>
                        )}
                        {viewingPlayer.join_date && (
                          <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-bold text-sm">🎯</span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">입단일</p>
                              <p className="font-semibold text-gray-800 text-sm">
                                {new Date(viewingPlayer.join_date).toLocaleDateString('ko-KR')}
                              </p>
                            </div>
                          </div>
                        )}
                        {viewingPlayer.notes && (
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <p className="text-xs text-gray-500 mb-1">메모</p>
                            <p className="text-gray-800 text-sm leading-relaxed">{viewingPlayer.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* Status Card */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <h4 className="text-base font-bold text-gray-800 mb-3">상태</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">활성 상태</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          viewingPlayer.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {viewingPlayer.is_active ? '활성' : '비활성'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">등록일</span>
                        <span className="text-xs font-medium text-gray-800">
                          {new Date(viewingPlayer.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <h4 className="text-base font-bold text-gray-800 mb-3">빠른 작업</h4>
                    <div className="space-y-2">
                      {canEditPlayer() && (
                        <button
                          onClick={() => {
                            setEditingPlayer(viewingPlayer)
                            setViewingPlayer(null)
                          }}
                          className="w-full flex items-center gap-2 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-blue-700 font-medium text-sm"
                        >
                          <Edit className="h-4 w-4" />
                          선수 정보 수정
                        </button>
                      )}
                      <button
                        onClick={handleCloseForm}
                        className="w-full flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-700 font-medium text-sm"
                      >
                        <X className="h-4 w-4" />
                        닫기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
