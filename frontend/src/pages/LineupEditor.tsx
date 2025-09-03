import { useState } from 'react'
import { Save, Download, Printer, RotateCcw } from 'lucide-react'

export default function LineupEditor() {
  const [selectedGame, setSelectedGame] = useState('')

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">라인업 생성</h1>
        <p className="page-subtitle">
          드래그앤드롭으로 선수를 배치하고 라인업을 생성하세요.
        </p>
      </div>

      {/* Game Selection */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center gap-4">
            <label className="form-label mb-0">경기 선택:</label>
            <select 
              value={selectedGame} 
              onChange={(e) => setSelectedGame(e.target.value)}
              className="form-select max-w-xs"
            >
              <option value="">경기를 선택하세요</option>
              <option value="1">vs LG 트윈스 (2024-12-25)</option>
              <option value="2">vs 두산 베어스 (2024-12-22)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lineup Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Players List */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">선수 목록</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div className="player-card">
                  <div className="player-number">18</div>
                  <div>
                    <p className="font-medium text-sm">김철수</p>
                    <p className="text-xs text-gray-500">P</p>
                  </div>
                </div>
                <div className="player-card">
                  <div className="player-number">25</div>
                  <div>
                    <p className="font-medium text-sm">이영희</p>
                    <p className="text-xs text-gray-500">C</p>
                  </div>
                </div>
                <div className="player-card">
                  <div className="player-number">7</div>
                  <div>
                    <p className="font-medium text-sm">박민수</p>
                    <p className="text-xs text-gray-500">1B</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lineup Grid */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">라인업</h3>
            </div>
            <div className="card-body">
              <div className="lineup-grid">
                {Array.from({ length: 9 }, (_, i) => (
                  <div key={i} className="position-card">
                    <div className="text-sm font-medium text-gray-500 mb-2">
                      {i + 1}번타자
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400 text-sm">빈칸</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Position Labels */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">포지션</div>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">P, C, 1B, 2B</div>
                    <div className="text-xs text-gray-500">3B, SS, LF, CF</div>
                    <div className="text-xs text-gray-500">RF, DH</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">타순</div>
                  <div className="text-xs text-gray-500">1번 ~ 9번</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">상태</div>
                  <div className="text-xs text-gray-500">선발/교체</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button className="btn btn-secondary flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          초기화
        </button>
        
        <div className="flex space-x-3">
          <button className="btn btn-secondary flex items-center gap-2">
            <Save className="h-4 w-4" />
            저장
          </button>
          <button className="btn btn-secondary flex items-center gap-2">
            <Download className="h-4 w-4" />
            PDF 다운로드
          </button>
          <button className="btn btn-primary flex items-center gap-2">
            <Printer className="h-4 w-4" />
            프린트
          </button>
        </div>
      </div>
    </div>
  )
}
