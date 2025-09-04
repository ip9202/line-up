import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLineup } from '../hooks/useLineups'
import { useGames } from '../hooks/useGames'
import { usePlayers } from '../hooks/usePlayers'
import api from '../lib/api'
import LineupSheet from '../components/LineupSheet'
import { ArrowLeft, Printer, Download } from 'lucide-react'

export default function LineupSheetPage() {
  const { lineupId } = useParams<{ lineupId: string }>()
  const navigate = useNavigate()
  const [attendance, setAttendance] = useState<{ [playerId: number]: boolean }>({})
  
  const { data: lineup, isLoading: lineupLoading } = useLineup(parseInt(lineupId || '0'))
  const { data: games, isLoading: gamesLoading } = useGames()
  const { data: players, isLoading: playersLoading } = usePlayers()

  // 선택된 라인업의 경기 정보
  const selectedGame = lineup?.game || games?.find(g => g.id === lineup?.game_id)

  // 출석 데이터 가져오기
  useEffect(() => {
    if (lineupId) {
      const fetchAttendance = async () => {
        try {
          const response = await api.get(`/lineups/${lineupId}/attendance`)
          setAttendance(response.data.attendance || {})
        } catch (error) {
          console.error('출석 데이터 가져오기 실패:', error)
          setAttendance({})
        }
      }
      fetchAttendance()
    }
  }, [lineupId])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // PDF 다운로드 로직 (나중에 구현)
    console.log('PDF 다운로드')
  }

  if (lineupLoading || gamesLoading || playersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!lineup || !selectedGame || !players) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">라인업을 찾을 수 없습니다</h2>
          <button
            onClick={() => navigate('/lineup/list')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            라인업 목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/lineup/list')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>라인업 목록</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                {lineup.name}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Printer className="h-4 w-4" />
                <span>프린트</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>PDF 다운로드</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 라인업 시트 */}
      <div className="py-6">
        <LineupSheet
          lineup={lineup}
          game={selectedGame}
          allPlayers={players}
          attendance={attendance}
          teamName="우리팀"
          managerName="감독"
        />
      </div>

    </div>
  )
}
