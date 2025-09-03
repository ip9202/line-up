import { useState } from 'react'
import { Plus, Search, Calendar, MapPin, Users, Edit, Trash2, Eye } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useGames, useCreateGame, useUpdateGame, useDeleteGame } from '../hooks/useGames'
import { Game } from '../types'
import GameForm from '../components/GameForm'

export default function Games() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  
  // 인증 상태
  const { user, isAuthenticated } = useAuth()

  // API hooks
  const { data: games = [], isLoading } = useGames()
  const createGameMutation = useCreateGame()
  const updateGameMutation = useUpdateGame()
  const deleteGameMutation = useDeleteGame()

  // 권한 체크 함수들
  const canManageGames = () => {
    return isAuthenticated && user?.role === '총무'
  }

  const canEditGame = () => {
    return isAuthenticated && user?.role === '총무'
  }

  const canDeleteGame = () => {
    return isAuthenticated && user?.role === '총무'
  }

  // 필터링된 경기 목록
  const filteredGames = games.filter(game => 
    game.opponent_team?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    game.venue?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 이벤트 핸들러들
  const handleAddGame = () => {
    setEditingGame(null)
    setIsFormOpen(true)
  }

  const handleEditGame = (game: Game) => {
    setEditingGame(game)
    setIsFormOpen(true)
  }

  const handleDeleteGame = async (game: Game) => {
    if (window.confirm(`"${game.opponent_team?.name || '상대팀'}" 경기를 삭제하시겠습니까?`)) {
      try {
        await deleteGameMutation.mutateAsync(game.id)
      } catch (error) {
        console.error('경기 삭제 실패:', error)
        alert('경기 삭제에 실패했습니다.')
      }
    }
  }

  const handleFormSubmit = async (gameData: any) => {
    try {
      if (editingGame) {
        await updateGameMutation.mutateAsync({ id: editingGame.id, game: gameData })
      } else {
        await createGameMutation.mutateAsync(gameData)
      }
      setIsFormOpen(false)
      setEditingGame(null)
    } catch (error) {
      console.error('경기 저장 실패:', error)
      alert('경기 저장에 실패했습니다.')
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingGame(null)
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">경기 관리</h1>
        <p className="page-subtitle">
          경기 일정을 관리하고 라인업을 준비하세요.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="상대팀으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        </div>
        <button 
          onClick={handleAddGame}
          disabled={!canManageGames()}
          className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors ${
            canManageGames()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus className="h-4 w-4" />
          경기 추가
        </button>
      </div>

      {/* Games List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">경기 목록을 불러오는 중...</p>
        </div>
      ) : filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => {
            const gameDate = new Date(game.game_date)
            const isUpcoming = gameDate > new Date()
            const isToday = gameDate.toDateString() === new Date().toDateString()
            
            return (
              <div key={game.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      vs {game.opponent_team?.name || '상대팀'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        isUpcoming 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : isToday
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {isUpcoming ? '예정' : isToday ? '오늘' : '완료'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="font-medium">
                      {gameDate.toLocaleDateString('ko-KR')} {gameDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-green-500" />
                    <span className="font-medium">{game.venue?.name || '경기장 미정'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="font-medium">{game.is_home ? '홈 경기' : '어웨이 경기'}</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors">
                      <Eye className="h-4 w-4" />
                      라인업
                    </button>
                    {canEditGame() && (
                      <button 
                        onClick={() => handleEditGame(game)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        수정
                      </button>
                    )}
                    {canDeleteGame() && (
                      <button 
                        onClick={() => handleDeleteGame(game)}
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
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? '검색 결과가 없습니다' : '등록된 경기가 없습니다'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? '다른 검색어를 시도해보세요.' : '첫 번째 경기를 추가해보세요.'}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <button 
                onClick={handleAddGame}
                disabled={!canManageGames()}
                className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors ${
                  canManageGames()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Plus className="h-4 w-4" />
                경기 추가
              </button>
            </div>
          )}
        </div>
      )}

      {/* Game Form Modal */}
      <GameForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        game={editingGame}
        isLoading={createGameMutation.isPending || updateGameMutation.isPending}
      />
    </div>
  )
}
