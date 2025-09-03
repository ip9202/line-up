import { useState } from 'react'
import { useLineups } from '../hooks/useLineups'
import LineupEditor from '../components/LineupEditor'
import { useAuth } from '../contexts/AuthContext'

export default function LineupEditorPage() {
  const [selectedLineupId, setSelectedLineupId] = useState<number | null>(null)
  const { data: lineups, isLoading } = useLineups()
  
  // 인증 상태
  const { user, isAuthenticated } = useAuth()

  // 권한 체크 함수들
  const canManageLineups = () => {
    return isAuthenticated && user?.role === '감독'
  }

  if (isLoading) {
    return <div className="loading">로딩 중...</div>
  }

  if (!selectedLineupId && lineups && lineups.length > 0) {
    setSelectedLineupId(lineups[0].id)
  }

  if (!selectedLineupId) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">라인업 편집</h1>
          <p className="page-subtitle">
            편집할 라인업을 선택하세요.
          </p>
        </div>
        
        <div className="card">
          <div className="card-body text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">라인업이 없습니다</h3>
            <p className="text-gray-500 mb-4">먼저 라인업을 생성해주세요.</p>
            <button 
              disabled={!canManageLineups()}
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                canManageLineups()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              라인업 생성
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">라인업 편집</h1>
        <p className="page-subtitle">
          선수들을 드래그하여 라인업을 구성하세요.
        </p>
      </div>

      {/* 라인업 선택 */}
      <div className="card">
        <div className="card-body">
          <h2 className="card-title">라인업 선택</h2>
          <select 
            className="form-select"
            value={selectedLineupId || ''}
            onChange={(e) => setSelectedLineupId(Number(e.target.value))}
          >
            {lineups?.map(lineup => (
              <option key={lineup.id} value={lineup.id}>
                {lineup.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 라인업 편집기 */}
      {selectedLineupId && (
        <LineupEditor lineupId={selectedLineupId} />
      )}
    </div>
  )
}