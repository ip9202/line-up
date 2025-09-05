import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { useLineups } from '../hooks/useLineups'
import { useTeams } from '../hooks/useTeams'
import LineupEditor from '../components/LineupEditor'
import { useAuth } from '../contexts/AuthContext'
import { Calendar, Users, Target, ArrowLeft, ClipboardList, FileText } from 'lucide-react'
import { createLineup } from '../services/lineupService'

export default function LineupEditorPage() {
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null)
  const [selectedLineupId, setSelectedLineupId] = useState<number | null>(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { data: games, isLoading: gamesLoading } = useGames()
  const { data: lineups, isLoading: lineupsLoading, refetch: refetchLineups } = useLineups()
  const { data: teams } = useTeams()
  
  // 인증 상태
  const { user, isAuthenticated } = useAuth()
  
  // 우리팀 찾기
  const ourTeam = teams?.find(team => team.is_our_team)

  // 새 라인업 생성 함수
  const handleCreateLineup = async () => {
    if (!selectedGameId) {
      console.error('selectedGameId가 없습니다:', selectedGameId)
      return
    }
    
    console.log('라인업 생성 시도:', { selectedGameId, gameId: searchParams.get('gameId') })
    
    try {
      const newLineup = await createLineup({
        game_id: selectedGameId,
        name: `라인업 ${new Date().toLocaleDateString()}`,
        is_default: false
      })
      
      console.log('라인업 생성 성공:', newLineup)
      
      // 라인업 목록 새로고침
      await refetchLineups()
      
      // 새로 생성된 라인업으로 이동
      setSelectedLineupId(newLineup.id)
    } catch (error) {
      console.error('라인업 생성 실패:', error)
      alert('라인업 생성에 실패했습니다: ' + (error as any)?.message)
    }
  }


  // URL 파라미터에서 gameId 처리
  useEffect(() => {
    const gameId = searchParams.get('gameId')
    console.log('URL gameId:', gameId)
    console.log('lineups:', lineups)
    if (gameId) {
      setSelectedGameId(parseInt(gameId))
      // gameId가 있으면 바로 라인업 편집 모드로 진입
      // 라인업이 없으면 자동으로 생성
      const gameLineups = lineups?.filter(lineup => lineup.game_id === parseInt(gameId)) || []
      console.log('gameLineups:', gameLineups)
      if (gameLineups.length === 0) {
        // 라인업이 없으면 자동으로 생성
        console.log('라인업 생성 시도')
        handleCreateLineup()
      } else {
        // 라인업이 있으면 첫 번째 라인업 선택
        console.log('기존 라인업 선택:', gameLineups[0].id)
        setSelectedLineupId(gameLineups[0].id)
      }
    }
  }, [searchParams, lineups])

  // 라인업 생성 후 selectedLineupId 설정
  useEffect(() => {
    console.log('selectedGameId:', selectedGameId)
    console.log('selectedLineupId:', selectedLineupId)
    if (selectedGameId && lineups) {
      const gameLineups = lineups.filter(lineup => lineup.game_id === selectedGameId)
      console.log('라인업 생성 후 gameLineups:', gameLineups)
      if (gameLineups.length > 0 && !selectedLineupId) {
        console.log('라인업 생성 후 selectedLineupId 설정:', gameLineups[0].id)
        setSelectedLineupId(gameLineups[0].id)
      }
    }
  }, [selectedGameId, lineups, selectedLineupId])

  // 권한 체크 함수들
  const canManageLineups = () => {
    return isAuthenticated && user?.role === '감독'
  }

  // 경기 선택 시 해당 경기의 라인업 찾기
  const selectedGameLineups = selectedGameId 
    ? lineups?.filter(lineup => lineup.game_id === selectedGameId) || []
    : []

  // 자동 선택 로직 제거 - 사용자가 직접 라인업을 선택하도록 함

  if (gamesLoading || lineupsLoading) {
    return <div className="loading">로딩 중...</div>
  }

  // 디버깅용 로그
  console.log('경기 데이터:', games)
  console.log('라인업 데이터:', lineups)

  // 경기 선택 화면
  if (!selectedGameId) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-blue-600" />
                </div>
                라인업 편집
              </h1>
              <p className="mt-2 text-gray-600">
                경기를 선택하여 라인업을 편집하세요
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {games?.length || 0}
              </div>
              <div className="text-sm text-gray-500">총 경기</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games?.map(game => (
            <div 
              key={game.id}
              onClick={() => {
                console.log('경기 클릭:', game)
                setSelectedGameId(game.id)
              }}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{game.opponent_team?.name || '상대팀'}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(game.game_date).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>{game.is_home ? '홈' : '원정'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>라인업 {lineups?.filter(l => l.game_id === game.id).length || 0}개</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {games?.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 경기가 없습니다</h3>
            <p className="text-gray-500">먼저 경기를 등록해주세요.</p>
          </div>
        )}
      </div>
    )
  }

  // 라인업 선택 화면은 제거 - 바로 편집 화면으로 이동

  // 라인업 편집 화면
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 헤더 카드 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/games')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">경기 관리</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ClipboardList className="h-6 w-6 text-blue-600" />
                  </div>
                  라인업 편집
                </h1>
                <p className="mt-2 text-gray-600">
                  {(() => {
                    const selectedGame = games?.find(g => g.id === selectedGameId)
                    if (!selectedGame) return '상대팀 vs 우리팀'
                    
                    const opponentTeam = selectedGame.opponent_team?.name || '상대팀'
                    const ourTeamName = ourTeam?.name || '우리팀'
                    
                    if (selectedGame.is_home) {
                      return `${opponentTeam} vs ${ourTeamName}`
                    } else {
                      return `${ourTeamName} vs ${opponentTeam}`
                    }
                  })()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {selectedLineupId && (
                <button
                  onClick={() => window.open(`/lineup/sheet/${selectedLineupId}`, '_blank')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  시트 보기
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 라인업 편집기 */}
        {selectedLineupId && (
          <LineupEditor lineupId={selectedLineupId} />
        )}
      </div>
    </div>
  )
}