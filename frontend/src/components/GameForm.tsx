import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useTeams } from '../hooks/useTeams'
import { useVenues } from '../hooks/useVenues'
import { Game, GameCreate, GameUpdate } from '../types'

interface GameFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (game: GameCreate | GameUpdate) => void
  game?: Game | null
  isLoading?: boolean
}

export default function GameForm({ isOpen, onClose, onSubmit, game, isLoading = false }: GameFormProps) {
  const [formData, setFormData] = useState({
    opponent_team_id: '',
    game_date: '',
    game_time: '',
    venue_id: '',
    is_home: true,
    game_type: 'REGULAR',
    status: 'SCHEDULED',
    notes: '',
  })

  const { data: teams = [] } = useTeams({ active: true })
  const { data: venues = [] } = useVenues({ active: true })

  useEffect(() => {
    if (game) {
      setFormData({
        opponent_team_id: game.opponent_team_id?.toString() || '',
        game_date: game.game_date ? game.game_date.split('T')[0] : '',
        game_time: game.game_date ? game.game_date.split('T')[1]?.substring(0, 5) : '',
        venue_id: game.venue_id?.toString() || '',
        is_home: game.is_home ?? true,
        game_type: game.game_type || 'REGULAR',
        status: game.status || 'SCHEDULED',
        notes: game.notes || '',
      })
    } else {
      setFormData({
        opponent_team_id: '',
        game_date: '',
        game_time: '',
        venue_id: '',
        is_home: true,
        game_type: 'REGULAR',
        status: 'SCHEDULED',
        notes: '',
      })
    }
  }, [game, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.opponent_team_id || !formData.game_date || !formData.game_time || !formData.venue_id) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    const gameData = {
      opponent_team_id: parseInt(formData.opponent_team_id),
      game_date: `${formData.game_date}T${formData.game_time}:00`,
      venue_id: parseInt(formData.venue_id),
      is_home: formData.is_home,
      game_type: formData.game_type,
      status: formData.status,
      notes: formData.notes || null,
    }

    console.log('전송할 게임 데이터:', gameData)
    onSubmit(gameData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {game ? '경기 수정' : '경기 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 상대팀 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상대팀 <span className="text-red-500">*</span>
            </label>
            <select
              name="opponent_team_id"
              value={formData.opponent_team_id}
              onChange={handleChange}
              className="form-select w-full"
              required
            >
              <option value="">상대팀을 선택하세요</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} {team.city && `(${team.city})`}
                </option>
              ))}
            </select>
          </div>

          {/* 경기 날짜 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              경기 날짜 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="game_date"
              value={formData.game_date}
              onChange={handleChange}
              className="form-input w-full"
              required
            />
          </div>

          {/* 경기 시간 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              경기 시간 <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="game_time"
              value={formData.game_time}
              onChange={handleChange}
              className="form-input w-full"
              required
            />
          </div>

          {/* 경기장 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              경기장 <span className="text-red-500">*</span>
            </label>
            <select
              name="venue_id"
              value={formData.venue_id}
              onChange={handleChange}
              className="form-select w-full"
              required
            >
              <option value="">경기장을 선택하세요</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} {venue.location && `(${venue.location})`}
                </option>
              ))}
            </select>
          </div>

          {/* 홈/어웨이 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              경기 유형
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="is_home"
                  value="true"
                  checked={formData.is_home === true}
                  onChange={() => setFormData(prev => ({ ...prev, is_home: true }))}
                  className="mr-2"
                />
                홈 경기
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="is_home"
                  value="false"
                  checked={formData.is_home === false}
                  onChange={() => setFormData(prev => ({ ...prev, is_home: false }))}
                  className="mr-2"
                />
                어웨이 경기
              </label>
            </div>
          </div>

          {/* 경기 타입 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              경기 타입
            </label>
            <select
              name="game_type"
              value={formData.game_type}
              onChange={handleChange}
              className="form-select w-full"
            >
              <option value="REGULAR">정규경기</option>
              <option value="FRIENDLY">친선경기</option>
              <option value="TOURNAMENT">대회</option>
              <option value="PRACTICE">연습경기</option>
            </select>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메모
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="form-textarea w-full"
              rows={3}
              placeholder="경기 관련 메모를 입력하세요"
            />
          </div>

          {/* 버튼 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '저장 중...' : (game ? '수정' : '추가')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
