import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { useLineups } from '../hooks/useLineups'
import { Game, Lineup } from '../types'
import { Calendar, Users, ArrowLeft } from 'lucide-react'

export default function LineupViewPage() {
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null)
  const [selectedLineupId, setSelectedLineupId] = useState<number | null>(null)
  const [searchParams] = useSearchParams()
  const { data: games, isLoading: gamesLoading } = useGames()
  const { data: lineups, isLoading: lineupsLoading } = useLineups()

  // URL 파라미터에서 gameId 처리
  useEffect(() => {
    const gameId = searchParams.get('gameId')
    if (gameId) {
      setSelectedGameId(parseInt(gameId))
    }
  }, [searchParams])

  // 선택된 경기의 라인업들
  const selectedGameLineups = lineups?.filter(lineup => lineup.game_id === selectedGameId) || []

  // 로딩 상태
  if (gamesLoading || lineupsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  // 경기 선택 화면
  if (!selectedGameId) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">라인업 보기</h1>
          <p className="text-gray-600">경기를 선택하여 라인업을 확인하세요.</p>
        </div>

        {games && games.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => (
              <div
                key={game.id}
                onClick={() => setSelectedGameId(game.id)}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {new Date(game.game_date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    game.is_home ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {game.is_home ? '홈' : '원정'}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">
                  vs {game.opponent_team?.name || '상대팀'}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>라인업 {lineups?.filter(l => l.game_id === game.id).length || 0}개</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 경기가 없습니다</h3>
            <p className="text-gray-500">감독이 경기를 등록하면 여기에서 확인할 수 있습니다.</p>
          </div>
        )}
      </div>
    )
  }

  // 라인업 선택 화면
  if (selectedGameId && !selectedLineupId) {
    const selectedGame = games?.find(g => g.id === selectedGameId)
    
    return (
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => setSelectedGameId(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>경기 선택으로 돌아가기</span>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {selectedGame?.opponent_team?.name || '상대팀'} vs 우리팀
          </h1>
          <p className="text-gray-600">
            {new Date(selectedGame?.game_date || '').toLocaleDateString()} 
            ({selectedGame?.is_home ? '홈' : '원정'})
          </p>
        </div>

        {selectedGameLineups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedGameLineups.map((lineup) => (
              <div
                key={lineup.id}
                onClick={() => setSelectedLineupId(lineup.id)}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{lineup.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>선수 {lineup.lineup_players?.length || 0}명</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">라인업이 없습니다</h3>
            <p className="text-gray-500">감독이 라인업을 생성하면 여기에서 확인할 수 있습니다.</p>
          </div>
        )}
      </div>
    )
  }

  // 라인업 상세 보기 화면
  if (selectedGameId && selectedLineupId) {
    const selectedGame = games?.find(g => g.id === selectedGameId)
    const selectedLineup = selectedGameLineups.find(l => l.id === selectedLineupId)
    
    if (!selectedLineup) {
      return (
        <div className="p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">라인업을 찾을 수 없습니다</h3>
            <button
              onClick={() => setSelectedLineupId(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              라인업 목록으로 돌아가기
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => setSelectedLineupId(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>라인업 목록으로 돌아가기</span>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedLineup.name}</h1>
          <p className="text-gray-600">
            {selectedGame?.opponent_team?.name || '상대팀'} vs 우리팀 • 
            {new Date(selectedGame?.game_date || '').toLocaleDateString()}
          </p>
        </div>

        {/* 라인업 테이블 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">라인업</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    타순
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    선수명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    포지션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* 타순 1-9 */}
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((order) => {
                  const lineupPlayer = selectedLineup.lineup_players?.find(
                    lp => lp.batting_order === order
                  )
                  return (
                    <tr key={order}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {lineupPlayer?.player?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lineupPlayer?.player?.number || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lineupPlayer?.position || '-'}
                      </td>
                    </tr>
                  )
                })}
                
                {/* 투수 */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    P
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {selectedLineup.lineup_players?.find(lp => lp.position === 'P')?.player?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {selectedLineup.lineup_players?.find(lp => lp.position === 'P')?.player?.number || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    투수
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return null
}
