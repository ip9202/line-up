import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useCreateTeam, useUpdateTeam } from '../hooks/useTeams'
import { Team, TeamCreate, TeamUpdate } from '../types'

interface TeamFormProps {
  team?: Team | null
  isEditMode: boolean
  onClose: () => void
}

export default function TeamForm({ team, isEditMode, onClose }: TeamFormProps) {
  const [formData, setFormData] = useState<TeamCreate>({
    name: '',
    city: '',
    league: '',
    is_active: true
  })

  const createTeamMutation = useCreateTeam()
  const updateTeamMutation = useUpdateTeam()

  // 폼 데이터 초기화
  useEffect(() => {
    if (team && isEditMode) {
      setFormData({
        name: team.name,
        city: team.city || '',
        league: team.league || '',
        is_active: team.is_active
      })
    } else {
      setFormData({
        name: '',
        city: '',
        league: '',
        is_active: true
      })
    }
  }, [team, isEditMode])

  // 폼 유효성 검사
  const validateForm = () => {
    if (!formData.name.trim()) {
      alert('팀명을 입력해주세요.')
      return false
    }
    return true
  }

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      if (isEditMode && team) {
        const updateData: TeamUpdate = {
          name: formData.name,
          city: formData.city || undefined,
          league: formData.league || undefined,
          is_active: formData.is_active
        }
        await updateTeamMutation.mutateAsync({ id: team.id, team: updateData })
      } else {
        const createData: TeamCreate = {
          name: formData.name,
          city: formData.city || undefined,
          league: formData.league || undefined,
          is_active: formData.is_active
        }
        await createTeamMutation.mutateAsync(createData)
      }
      onClose()
    } catch (error) {
      console.error('팀 저장 실패:', error)
      alert('팀 저장에 실패했습니다.')
    }
  }

  // 입력 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const isLoading = createTeamMutation.isPending || updateTeamMutation.isPending

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditMode ? '팀 수정' : '팀 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 팀명 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              팀명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="팀명을 입력하세요"
            />
          </div>

          {/* 도시 */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              도시
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="form-input"
              placeholder="도시명을 입력하세요"
            />
          </div>

          {/* 리그 */}
          <div>
            <label htmlFor="league" className="block text-sm font-medium text-gray-700 mb-1">
              리그
            </label>
            <input
              type="text"
              id="league"
              name="league"
              value={formData.league}
              onChange={handleChange}
              className="form-input"
              placeholder="리그명을 입력하세요"
            />
          </div>

          {/* 활성 상태 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              활성 상태
            </label>
          </div>

          {/* 버튼 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '저장 중...' : (isEditMode ? '수정' : '추가')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
