import { Users, Calendar, ClipboardList, FileText, Home } from 'lucide-react'
import { usePlayers } from '../hooks/usePlayers'
import { useGames } from '../hooks/useGames'
import { useLineups } from '../hooks/useLineups'

export default function Dashboard() {
  // 실데이터 가져오기
  const { data: playersData, isLoading: playersLoading } = usePlayers()
  const { data: games, isLoading: gamesLoading } = useGames()
  const { data: lineups, isLoading: lineupsLoading } = useLineups()

  // 데이터 처리
  const players = playersData || []
  const totalPlayers = players.length
  const activePlayers = players.filter(p => p.is_active).length
  
  // 예정된 경기 (SCHEDULED 상태)
  const scheduledGames = games?.filter(g => g.status === 'SCHEDULED') || []
  const scheduledGamesCount = scheduledGames.length
  
  // 저장된 라인업
  const totalLineups = lineups?.length || 0
  
  // 이번 달 경기 (현재 월의 경기)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthGames = games?.filter(g => {
    const gameDate = new Date(g.game_date)
    return gameDate.getMonth() === currentMonth && gameDate.getFullYear() === currentYear
  }) || []
  const thisMonthGamesCount = thisMonthGames.length

  // 통계 데이터
  const stats = [
    {
      name: '총 선수',
      value: totalPlayers.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: '예정된 경기',
      value: scheduledGamesCount.toString(),
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: '저장된 라인업',
      value: totalLineups.toString(),
      icon: ClipboardList,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: '이번 달 경기',
      value: thisMonthGamesCount.toString(),
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  // 최근 경기 (최신 3개)
  const recentGames = games?.slice(0, 3) || []
  
  // 최근 라인업 (최신 3개)
  const recentLineups = lineups?.slice(0, 3) || []

  // 로딩 상태
  if (playersLoading || gamesLoading || lineupsLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card">
              <div className="card-body">
                <div className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              대시보드
            </h1>
            <p className="mt-2 text-gray-600">
              야구 라인업 관리 시스템에 오신 것을 환영합니다.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {stats.reduce((sum, stat) => sum + parseInt(stat.value), 0)}
            </div>
            <div className="text-sm text-gray-500">총 데이터</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">최근 경기</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recentGames.length > 0 ? (
                recentGames.map((game) => {
                  const gameDate = new Date(game.game_date)
                  const formattedDate = gameDate.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'SCHEDULED': return 'bg-green-100 text-green-800'
                      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
                      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
                      case 'CANCELLED': return 'bg-red-100 text-red-800'
                      default: return 'bg-gray-100 text-gray-800'
                    }
                  }
                  
                  const getStatusText = (status: string) => {
                    switch (status) {
                      case 'SCHEDULED': return '예정'
                      case 'IN_PROGRESS': return '진행중'
                      case 'COMPLETED': return '완료'
                      case 'CANCELLED': return '취소'
                      default: return status
                    }
                  }
                  
                  return (
                    <div key={game.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          vs {game.opponent_team?.name || '상대팀'}
                        </p>
                        <p className="text-sm text-gray-500">{formattedDate}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(game.status)}`}>
                        {getStatusText(game.status)}
                      </span>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500">등록된 경기가 없습니다.</p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">최근 라인업</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recentLineups.length > 0 ? (
                recentLineups.map((lineup) => {
                  const lineupDate = new Date(lineup.created_at)
                  const formattedDate = lineupDate.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })
                  
                  return (
                    <div key={lineup.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {lineup.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {lineup.game?.opponent_team?.name ? `vs ${lineup.game.opponent_team.name}` : '경기 정보 없음'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        lineup.is_default ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {lineup.is_default ? '기본' : '백업'}
                      </span>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500">등록된 라인업이 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
