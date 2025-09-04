import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Printer, Eye, Edit, Trash2, ClipboardList, FileText } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function LineupList() {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()
  
  // 인증 상태
  const { user, isAuthenticated } = useAuth()

  // 권한 체크 함수들
  const canManageLineups = () => {
    return isAuthenticated && user?.role === '감독'
  }

  const canEditLineup = () => {
    return isAuthenticated && user?.role === '감독'
  }

  const canDeleteLineup = () => {
    return isAuthenticated && user?.role === '감독'
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
              라인업 목록
            </h1>
            <p className="mt-2 text-gray-600">
              저장된 라인업을 관리하고 활용하세요.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {lineups.length}
            </div>
            <div className="text-sm text-gray-500">총 라인업</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="라인업 이름으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      {/* Lineup List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">12월 25일 라인업</h3>
              <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                기본
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">경기:</span> vs LG 트윈스
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">일시:</span> 2024-12-25 14:00
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">장소:</span> 잠실야구장
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">생성일:</span> 2024-12-20
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button className="btn btn-primary text-sm flex-1 flex items-center justify-center gap-1">
                  <Eye className="h-3 w-3" />
                  보기
                </button>
                <button 
                  onClick={() => window.open('/lineup/sheet/1', '_blank')}
                  className="btn btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  시트
                </button>
                {canEditLineup() && (
                  <button className="btn btn-secondary text-sm flex items-center justify-center gap-1">
                    <Edit className="h-3 w-3" />
                    수정
                  </button>
                )}
                <button className="btn btn-secondary text-sm flex items-center justify-center gap-1">
                  <Printer className="h-3 w-3" />
                  프린트
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">12월 22일 라인업</h3>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                백업
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">경기:</span> vs 두산 베어스
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">일시:</span> 2024-12-22 18:30
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">장소:</span> 잠실야구장
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">생성일:</span> 2024-12-18
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button className="btn btn-primary text-sm flex-1 flex items-center justify-center gap-1">
                  <Eye className="h-3 w-3" />
                  보기
                </button>
                <button 
                  onClick={() => window.open('/lineup/sheet/1', '_blank')}
                  className="btn btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  시트
                </button>
                {canEditLineup() && (
                  <button className="btn btn-secondary text-sm flex items-center justify-center gap-1">
                    <Edit className="h-3 w-3" />
                    수정
                  </button>
                )}
                <button className="btn btn-secondary text-sm flex items-center justify-center gap-1">
                  <Printer className="h-3 w-3" />
                  프린트
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">12월 20일 라인업</h3>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                백업
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">경기:</span> vs 키움 히어로즈
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">일시:</span> 2024-12-20 19:00
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">장소:</span> 고척스카이돔
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">생성일:</span> 2024-12-15
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button className="btn btn-primary text-sm flex-1 flex items-center justify-center gap-1">
                  <Eye className="h-3 w-3" />
                  보기
                </button>
                <button 
                  onClick={() => window.open('/lineup/sheet/1', '_blank')}
                  className="btn btn-secondary text-sm flex items-center justify-center gap-1"
                >
                  <FileText className="h-3 w-3" />
                  시트
                </button>
                {canEditLineup() && (
                  <button className="btn btn-secondary text-sm flex items-center justify-center gap-1">
                    <Edit className="h-3 w-3" />
                    수정
                  </button>
                )}
                <button className="btn btn-secondary text-sm flex items-center justify-center gap-1">
                  <Printer className="h-3 w-3" />
                  프린트
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="text-center py-12">
        <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">저장된 라인업이 없습니다</h3>
        <p className="mt-1 text-sm text-gray-500">
          첫 번째 라인업을 생성해보세요.
        </p>
        <div className="mt-6">
          <button className="btn btn-primary">
            라인업 생성하기
          </button>
        </div>
      </div>
    </div>
  )
}
