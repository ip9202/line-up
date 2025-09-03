import { useState } from 'react'
import { Plus, Search, Calendar, MapPin, Users } from 'lucide-react'

export default function Games() {
  const [searchTerm, setSearchTerm] = useState('')

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
        <button className="btn btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          경기 추가
        </button>
      </div>

      {/* Games List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">vs LG 트윈스</h3>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                예정
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                2024-12-25 14:00
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                잠실야구장
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                홈 경기
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button className="btn btn-primary text-sm flex-1">
                  라인업 생성
                </button>
                <button className="btn btn-secondary text-sm">
                  수정
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">vs 두산 베어스</h3>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                완료
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                2024-12-22 18:30
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                잠실야구장
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                홈 경기
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button className="btn btn-secondary text-sm flex-1">
                  라인업 보기
                </button>
                <button className="btn btn-secondary text-sm">
                  수정
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">경기가 없습니다</h3>
        <p className="mt-1 text-sm text-gray-500">
          첫 번째 경기를 추가해보세요.
        </p>
        <div className="mt-6">
          <button className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            경기 추가
          </button>
        </div>
      </div>
    </div>
  )
}
