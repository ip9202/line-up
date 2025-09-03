import { useState } from 'react'
import { Plus, Search, Filter, Users } from 'lucide-react'

export default function Players() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">선수 관리</h1>
        <p className="page-subtitle">
          팀 선수들의 정보를 관리하고 라인업에 활용하세요.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="선수 이름으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          <button className="btn btn-secondary flex items-center gap-2">
            <Filter className="h-4 w-4" />
            필터
          </button>
        </div>
        <button className="btn btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          선수 추가
        </button>
      </div>

      {/* Players Table */}
      <div className="card">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>등번호</th>
                  <th>이름</th>
                  <th>나이</th>
                  <th>출신지</th>
                  <th>학교</th>
                  <th>선호포지션</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="player-number">18</div>
                  </td>
                  <td className="font-medium">김철수</td>
                  <td>25</td>
                  <td>서울</td>
                  <td>고려대학교</td>
                  <td>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      P
                    </span>
                  </td>
                  <td>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      활성
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button className="text-primary-600 hover:text-primary-800 text-sm">
                        수정
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm">
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="player-number">25</div>
                  </td>
                  <td className="font-medium">이영희</td>
                  <td>23</td>
                  <td>부산</td>
                  <td>연세대학교</td>
                  <td>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      C
                    </span>
                  </td>
                  <td>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      활성
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <button className="text-primary-600 hover:text-primary-800 text-sm">
                        수정
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm">
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">선수가 없습니다</h3>
        <p className="mt-1 text-sm text-gray-500">
          첫 번째 선수를 추가해보세요.
        </p>
        <div className="mt-6">
          <button className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            선수 추가
          </button>
        </div>
      </div>
    </div>
  )
}
