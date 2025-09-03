import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Venue, VenueCreate, VenueUpdate } from '../types'

interface VenueFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (venue: VenueCreate | VenueUpdate) => void
  venue?: Venue | null
  isLoading?: boolean
}

export default function VenueForm({ isOpen, onClose, onSubmit, venue, isLoading = false }: VenueFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: '',
    surface_type: '',
    is_indoor: false,
    notes: '',
    is_active: true,
  })

  useEffect(() => {
    if (venue) {
      setFormData({
        name: venue.name || '',
        location: venue.location || '',
        capacity: venue.capacity?.toString() || '',
        surface_type: venue.surface_type || '',
        is_indoor: venue.is_indoor || false,
        notes: venue.notes || '',
        is_active: venue.is_active ?? true,
      })
    } else {
      setFormData({
        name: '',
        location: '',
        capacity: '',
        surface_type: '',
        is_indoor: false,
        notes: '',
        is_active: true,
      })
    }
  }, [venue, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('경기장명을 입력해주세요.')
      return
    }

    const venueData = {
      name: formData.name.trim(),
      location: formData.location.trim() || undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      surface_type: formData.surface_type.trim() || undefined,
      is_indoor: formData.is_indoor,
      notes: formData.notes.trim() || undefined,
      is_active: formData.is_active,
    }

    onSubmit(venueData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
            {venue ? '경기장 수정' : '경기장 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 경기장명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              경기장명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="경기장명을 입력하세요"
              className="form-input w-full"
              required
            />
          </div>

          {/* 위치 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              위치
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="주소 또는 위치를 입력하세요"
              className="form-input w-full"
            />
          </div>

          {/* 수용 인원 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              수용 인원
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="수용 인원을 입력하세요"
              className="form-input w-full"
              min="0"
            />
          </div>

          {/* 표면 타입 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              표면 타입
            </label>
            <select
              name="surface_type"
              value={formData.surface_type}
              onChange={handleChange}
              className="form-select w-full"
            >
              <option value="">선택하세요</option>
              <option value="잔디">잔디</option>
              <option value="인조잔디">인조잔디</option>
              <option value="흙">흙</option>
              <option value="모래">모래</option>
              <option value="기타">기타</option>
            </select>
          </div>

          {/* 실내/실외 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              경기장 유형
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="is_indoor"
                  value="false"
                  checked={formData.is_indoor === false}
                  onChange={() => setFormData(prev => ({ ...prev, is_indoor: false }))}
                  className="mr-2"
                />
                실외
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="is_indoor"
                  value="true"
                  checked={formData.is_indoor === true}
                  onChange={() => setFormData(prev => ({ ...prev, is_indoor: true }))}
                  className="mr-2"
                />
                실내
              </label>
            </div>
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
              placeholder="기타 메모를 입력하세요"
              className="form-input w-full"
              rows={3}
            />
          </div>

          {/* 활성 상태 */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="mr-2"
              />
              활성 상태
            </label>
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
              {isLoading ? '저장 중...' : (venue ? '수정' : '추가')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
