import { useState, useEffect } from 'react'
import { X, Save, User } from 'lucide-react'
import { useCreatePlayer, useUpdatePlayer, usePlayers } from '../hooks/usePlayers'
import { useTeams } from '../hooks/useTeams'
import { Player, PlayerCreate, PlayerUpdate, PlayerRole } from '../types'

interface PlayerFormProps {
  player?: Player | null
  onClose: () => void
}

export default function PlayerForm({ player, onClose }: PlayerFormProps) {
  const [formData, setFormData] = useState<PlayerCreate>({
    name: '',
    number: undefined,
    phone: '',
    email: '',
    team_id: undefined,
    role: '선수',
    age: undefined,
    birth_date: '',
    hometown: '',
    school: '',
    position_preference: '',
    height: undefined,
    weight: undefined,
    join_date: '',
    is_professional: false,
    notes: '',
    is_active: true
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createPlayerMutation = useCreatePlayer()
  const updatePlayerMutation = useUpdatePlayer()
  const { data: teams, isLoading: teamsLoading } = useTeams()
  const { data: players } = usePlayers()

  // 편집 모드일 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (player) {
      setFormData({
        name: player.name,
        number: player.number || undefined,
        phone: player.phone || '',
        email: player.email || '',
        team_id: player.team_id || undefined,
        role: player.role,
        age: player.age || undefined,
        birth_date: player.birth_date || '',
        hometown: player.hometown || '',
        school: player.school || '',
        position_preference: player.position_preference || '',
        height: player.height || undefined,
        weight: player.weight || undefined,
        join_date: player.join_date || '',
        is_professional: player.is_professional || false,
        notes: player.notes || '',
        is_active: player.is_active
      })
    }
  }, [player])

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/\D/g, '')
    
    // 11자리 제한
    const limitedNumbers = numbers.slice(0, 11)
    
    // 하이픈 추가
    if (limitedNumbers.length <= 3) {
      return limitedNumbers
    } else if (limitedNumbers.length <= 7) {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`
    } else {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`
    }
  }

  // 폼 데이터 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    let processedValue = value
    
    // 전화번호 필드인 경우 자동 포맷팅
    if (name === 'phone') {
      processedValue = formatPhoneNumber(value)
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (processedValue ? Number(processedValue) : undefined) : processedValue
    }))

    // 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // 폼 검증
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = '이름은 필수입니다.'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.'
    }

    if (formData.phone && !/^010-\d{4}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = '010-XXXX-XXXX 형식으로 입력해주세요.'
    }

    if (formData.age && (formData.age < 1 || formData.age > 100)) {
      newErrors.age = '나이는 1-100 사이여야 합니다.'
    }

    if (formData.height && (formData.height < 100 || formData.height > 250)) {
      newErrors.height = '신장은 100-250cm 사이여야 합니다.'
    }

    if (formData.weight && (formData.weight < 30 || formData.weight > 200)) {
      newErrors.weight = '체중은 30-200kg 사이여야 합니다.'
    }

    // 소속팀 필수 검증
    if (!formData.team_id) {
      newErrors.team_id = '소속팀을 선택해주세요.'
    }

    // 등번호 중복 검증 (같은 팀 내에서만, 생성 모드에서만)
    if (!player && formData.number && formData.team_id) {
      const existingPlayer = players?.find(p => 
        p.number === formData.number && p.team_id === formData.team_id
      )
      if (existingPlayer) {
        newErrors.number = `해당 팀에서 등번호 ${formData.number}번은 이미 사용 중입니다.`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (player) {
        // 수정 모드 - undefined 값들 제거
        const updateData: PlayerUpdate = {}
        Object.keys(formData).forEach(key => {
          let value = formData[key as keyof typeof formData]
          if (value !== undefined && value !== '') {
            // 전화번호인 경우 하이픈 제거
            if (key === 'phone' && typeof value === 'string') {
              value = value.replace(/\D/g, '') as any
            }
            updateData[key as keyof PlayerUpdate] = value
          }
        })
        
        console.log('업데이트 데이터:', updateData)
        await updatePlayerMutation.mutateAsync({ id: player.id, player: updateData })
        alert('선수 정보가 수정되었습니다.')
      } else {
        // 생성 모드 - undefined 값들 제거
        const createData: PlayerCreate = {}
        Object.keys(formData).forEach(key => {
          let value = formData[key as keyof typeof formData]
          if (value !== undefined && value !== '') {
            // 전화번호인 경우 하이픈 제거
            if (key === 'phone' && typeof value === 'string') {
              value = value.replace(/\D/g, '') as any
            }
            createData[key as keyof PlayerCreate] = value
          }
        })
        
        console.log('생성 데이터:', createData)
        await createPlayerMutation.mutateAsync(createData)
        alert('새 선수가 추가되었습니다.')
      }
      
      onClose()
    } catch (error) {
      console.error('선수 저장 실패:', error)
      console.error('에러 상세:', error)
      alert(`선수 저장에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditMode = !!player

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            {isEditMode ? '선수 정보 수정' : '새 선수 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                placeholder="선수 이름"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">등번호</label>
              <input
                type="number"
                name="number"
                value={formData.number || ''}
                onChange={handleChange}
                className={`form-input ${errors.number ? 'border-red-500' : ''}`}
                placeholder="등번호"
                min="1"
                max="99"
              />
              {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">역할</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-select"
              >
                <option value="선수">선수</option>
                <option value="감독">감독</option>
                <option value="코치">코치</option>
                <option value="총무">총무</option>
                <option value="회장">회장</option>
                <option value="고문">고문</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                소속 팀 <span className="text-red-500">*</span>
              </label>
              <select
                name="team_id"
                value={formData.team_id || ''}
                onChange={handleChange}
                className={`form-select ${errors.team_id ? 'border-red-500' : ''}`}
                disabled={teamsLoading}
                required
              >
                <option value="">팀을 선택하세요</option>
                {teams?.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              {teamsLoading && (
                <p className="text-sm text-gray-500 mt-1">팀 목록을 불러오는 중...</p>
              )}
              {errors.team_id && <p className="text-red-500 text-sm mt-1">{errors.team_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">나이</label>
              <input
                type="number"
                name="age"
                value={formData.age || ''}
                onChange={handleChange}
                className={`form-input ${errors.age ? 'border-red-500' : ''}`}
                placeholder="나이"
                min="1"
                max="100"
              />
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전화번호
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="010-1234-5678"
                required
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="player@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* 개인 정보 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">개인 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">출신지</label>
                <input
                  type="text"
                  name="hometown"
                  value={formData.hometown}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="출신지"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">학교</label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="학교명"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">생년월일</label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">입단일</label>
                <input
                  type="date"
                  name="join_date"
                  value={formData.join_date}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">신장 (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height || ''}
                  onChange={handleChange}
                  className={`form-input ${errors.height ? 'border-red-500' : ''}`}
                  placeholder="신장"
                  min="100"
                  max="250"
                />
                {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">체중 (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight || ''}
                  onChange={handleChange}
                  className={`form-input ${errors.weight ? 'border-red-500' : ''}`}
                  placeholder="체중"
                  min="30"
                  max="200"
                />
                {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
              </div>
            </div>
          </div>

          {/* 야구 관련 정보 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">야구 관련 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">선호 포지션</label>
                <select
                  name="position_preference"
                  value={formData.position_preference}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">선택하세요</option>
                  <option value="P">P (투수)</option>
                  <option value="C">C (포수)</option>
                  <option value="1B">1B (1루수)</option>
                  <option value="2B">2B (2루수)</option>
                  <option value="3B">3B (3루수)</option>
                  <option value="SS">SS (유격수)</option>
                  <option value="LF">LF (좌익수)</option>
                  <option value="CF">CF (중견수)</option>
                  <option value="RF">RF (우익수)</option>
                  <option value="DH">DH (지명타자)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">선수출신 여부</label>
                <select
                  name="is_professional"
                  value={formData.is_professional ? 'true' : 'false'}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_professional: e.target.value === 'true' }))}
                  className="form-select"
                >
                  <option value="false">비선수출신</option>
                  <option value="true">선수출신</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                <select
                  name="is_active"
                  value={formData.is_active ? 'true' : 'false'}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                  className="form-select"
                >
                  <option value="true">활성</option>
                  <option value="false">비활성</option>
                </select>
              </div>
            </div>
          </div>

          {/* 메모 */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">메모</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">특이사항</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="form-textarea"
                rows={4}
                placeholder="선수에 대한 특이사항이나 메모를 입력하세요..."
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditMode ? '수정' : '추가'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
