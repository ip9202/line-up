import { useState, useEffect } from 'react'
import { usePlayers, useLineup, useAddPlayerToLineup, useRemovePlayerFromLineup } from '../hooks/useLineups'
import { usePlayers as usePlayersList } from '../hooks/usePlayers'
import { useTeams } from '../hooks/useTeams'
import { Player } from '../types'
import LineupCard from './LineupCard'
import PlayerCard from './PlayerCard'
import { Search, Filter, Users, Target, AlertCircle, Calendar, MapPin, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getAttendance, updateAttendance } from '../services/attendanceService'
import { updateLineupPlayerPosition } from '../services/lineupService'
import api from '../lib/api'

interface LineupEditorProps {
  lineupId: number
}

export default function LineupEditor({ lineupId }: LineupEditorProps) {
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null)
  const [lineupData, setLineupData] = useState<{ [key: number]: { player: Player; position: string } }>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPosition, setSelectedPosition] = useState<string>('')
  const [attendanceFilter, setAttendanceFilter] = useState<string>('all')
  const [dragoverRow, setDragoverRow] = useState<number | null>(null)
  const [attendance, setAttendance] = useState<{ [playerId: number]: boolean }>({})

  const { data: lineup, isLoading: lineupLoading } = useLineup(lineupId)
  const { data: players, isLoading: playersLoading } = usePlayersList()
  const { data: teams } = useTeams()
  const addPlayerMutation = useAddPlayerToLineup()
  const removePlayerMutation = useRemovePlayerFromLineup()
  
  // 인증 상태
  const { user, isAuthenticated } = useAuth()

  // 권한 체크 함수
  const canManageLineups = () => {
    return isAuthenticated && user?.role === '감독'
  }

  // 우리팀 ID 찾기
  const getOurTeamId = () => {
    return teams?.find(team => team.is_our_team)?.id
  }

  // 라인업 데이터 초기화
  useEffect(() => {
    if (lineup) {
      const initialData: { [key: number]: { player: Player; position: string } } = {}
      lineup.lineup_players.forEach(lp => {
        const player = players?.find(p => p.id === lp.player_id)
        if (player) {
          // 투수는 0번으로 처리
          if (lp.position === 'P' && lp.batting_order === 0) {
            initialData[0] = {
              player,
              position: 'P'
            }
          } else {
            // 일반 타순 선수들 (1-9번)
            if (lp.batting_order >= 1 && lp.batting_order <= 9) {
              initialData[lp.batting_order] = {
                player,
                position: lp.position || ''
              }
            }
          }
        }
      })
      setLineupData(initialData)
    }
  }, [lineup, players])

  // 선수의 라인업 상태 분석
  const getPlayerLineupStatus = (playerId: number) => {
    if (!lineup?.lineup_players) return 'none'
    
    const playerLineups = lineup.lineup_players.filter(lp => lp.player_id === playerId)
    if (playerLineups.length === 0) return 'none'
    
    const hasBatter = playerLineups.some(lp => lp.position !== 'P')
    const hasPitcher = playerLineups.some(lp => lp.position === 'P')
    
    if (hasBatter && hasPitcher) return 'both'
    if (hasBatter) return 'batter'
    if (hasPitcher) return 'pitcher'
    return 'none'
  }

  // 필터링된 선수 목록 (우리팀 선수만 표시)
  const filteredPlayers = players?.filter(player => {
    const ourTeamId = getOurTeamId()
    const isOurTeamPlayer = ourTeamId ? player.team_id === ourTeamId : false
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPosition = !selectedPosition || player.position_preference === selectedPosition
    const matchesAttendance = attendanceFilter === 'all' || 
      (attendanceFilter === 'present' && attendance[player.id]) ||
      (attendanceFilter === 'absent' && !attendance[player.id])
    
    return isOurTeamPlayer && matchesSearch && matchesPosition && matchesAttendance
  }) || []

  // 포지션 옵션
  const positionOptions = [
    { value: '', label: '전체' },
    { value: 'P', label: 'P' },
    { value: 'C', label: '포수' },
    { value: '1B', label: '1루수' },
    { value: '2B', label: '2루수' },
    { value: '3B', label: '3루수' },
    { value: 'SS', label: '유격수' },
    { value: 'LF', label: '좌익수' },
    { value: 'CF', label: '중견수' },
    { value: 'RF', label: '우익수' },
    { value: 'DH', label: '지명타자' },
  ]

  // 출석 옵션
  const attendanceOptions = [
    { value: 'all', label: '전체' },
    { value: 'present', label: '출석' },
    { value: 'absent', label: '미출석' }
  ]

  const handlePlayerDrop = async (battingOrder: number, player: Player) => {
    try {
      // 투수인 경우 특별 처리
      const isPitcher = battingOrder === 0
      let position, actualBattingOrder

      if (isPitcher) {
        // 투수는 포지션 P, 타순은 0 (투수 전용)
        position = 'P'
        actualBattingOrder = 0
      } else {
        // 일반 선수는 포지션 없이 추가 (감독이 나중에 설정)
        position = ''
        actualBattingOrder = battingOrder
      }

      // 선수 추가 (백엔드에서 교체 처리)
      await addPlayerMutation.mutateAsync({
        lineupId,
        playerData: {
          player_id: player.id,
          position: position,
          batting_order: actualBattingOrder,
          is_starter: true
        }
      })

      // 로컬 상태 업데이트
      setLineupData(prev => ({
        ...prev,
        [battingOrder]: {
          player,
          position: position
        }
      }))
      
      // 드래그오버 상태 초기화
      setDragoverRow(null)
    } catch (error: any) {
      console.error('선수 추가 실패:', error)
      
      // 에러 메시지를 사용자에게 표시
      if (error?.response?.data?.detail) {
        alert(error.response.data.detail)
      } else {
        alert('선수 추가에 실패했습니다. 다시 시도해주세요.')
      }
    }
  }

  const handleDragOver = (e: React.DragEvent, battingOrder: number) => {
    e.preventDefault()
    setDragoverRow(battingOrder)
  }

  const handleDragLeave = () => {
    setDragoverRow(null)
  }

  const handleAttendanceChange = async (playerId: number, isPresent: boolean) => {
    const newAttendance = {
      ...attendance,
      [playerId]: isPresent
    }
    setAttendance(newAttendance)
    
    // 출석 상태를 서버에 저장
    try {
      await updateAttendance(lineupId, newAttendance)
    } catch (error) {
      console.error('출석 상태 저장 실패:', error)
    }
  }

  // 라인업 로드 시 출석 상태 불러오기
  useEffect(() => {
    const loadAttendance = async () => {
      if (lineupId) {
        try {
          const savedAttendance = await getAttendance(lineupId)
          setAttendance(savedAttendance)
        } catch (error) {
          console.error('출석 상태 불러오기 실패:', error)
        }
      }
    }
    
    loadAttendance()
  }, [lineupId])

  const handlePlayerRemove = async (battingOrder: number) => {
    try {
      const lineupPlayer = lineup?.lineup_players.find(
        lp => (battingOrder === 0 && lp.position === 'P') || lp.batting_order === battingOrder
      )
      if (lineupPlayer) {
        await removePlayerMutation.mutateAsync({
          lineupId,
          lineupPlayerId: lineupPlayer.id
        })

        // 로컬 상태 업데이트
        setLineupData(prev => {
          const newData = { ...prev }
          delete newData[battingOrder]
          return newData
        })
      }
    } catch (error) {
      console.error('선수 제거 실패:', error)
    }
  }

  const handlePositionChange = async (battingOrder: number, newPosition: string) => {
    try {
      const lineupPlayer = lineup?.lineup_players.find(
        lp => (battingOrder === 0 && lp.position === 'P') || lp.batting_order === battingOrder
      )
      
      if (lineupPlayer) {
        // 백엔드 API 호출하여 포지션 업데이트
        await updateLineupPlayerPosition(lineupId, lineupPlayer.id, newPosition)

        // 로컬 상태 업데이트
        setLineupData(prev => ({
          ...prev,
          [battingOrder]: {
            ...prev[battingOrder],
            position: newPosition
          }
        }))
      }
    } catch (error) {
      console.error('포지션 변경 실패:', error)
    }
  }

  // 사용된 포지션 계산
  const getUsedPositions = () => {
    const used = new Set<string>()
    Object.values(lineupData).forEach(item => {
      if (item?.position && item.position !== '') {
        used.add(item.position)
      }
    })
    return Array.from(used)
  }

  if (lineupLoading || playersLoading) {
    return <div className="loading">로딩 중...</div>
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">로그인이 필요합니다</h3>
          <p className="text-gray-500">라인업을 편집하려면 먼저 로그인해주세요.</p>
        </div>
      </div>
    )
  }

  // 권한이 없는 경우
  if (!canManageLineups()) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">권한이 없습니다</h3>
          <p className="text-gray-500">라인업 편집은 감독 권한이 필요합니다.</p>
          <p className="text-sm text-gray-400 mt-2">현재 역할: {user?.role || '알 수 없음'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="lineup-editor-layout">
      {/* 왼쪽: 라인업 테이블 */}
      <div className="lineup-section">
        {/* 경기 정보 카드 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              vs {lineup?.game?.opponent_team?.name || '상대팀'}
            </h2>
            {/* 데스크톱: 가로 배치, 모바일: 세로 배치 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
                <span className="font-medium text-blue-600">
                  {lineup?.game?.game_date ? new Date(lineup.game.game_date).toLocaleDateString('ko-KR') : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="font-medium text-green-600">
                  {lineup?.game?.venue?.name || '경기장 미정'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  lineup?.game?.is_home 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {lineup?.game?.is_home ? '홈' : '원정'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 라인업 테이블 */}
        <div className="lineup-table-container">
          <table className="lineup-table">
            <thead>
              <tr>
                <th className="w-8">타순</th>
                <th className="w-20">위치</th>
                <th className="flex-1">성명</th>
                <th className="w-10">배번</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 9 }, (_, i) => i + 1).map(battingOrder => (
                <LineupCard
                  key={battingOrder}
                  battingOrder={battingOrder}
                  player={lineupData[battingOrder]?.player}
                  position={lineupData[battingOrder]?.position}
                  onDrop={handlePlayerDrop}
                  onRemove={handlePlayerRemove}
                  onPositionChange={handlePositionChange}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  isDragover={dragoverRow === battingOrder}
                  usedPositions={getUsedPositions()}
                />
              ))}
              {/* 투수 행 추가 */}
              <LineupCard
                key={0}
                battingOrder={0}
                player={lineupData[0]?.player}
                position={lineupData[0]?.position}
                onDrop={handlePlayerDrop}
                onRemove={handlePlayerRemove}
                onPositionChange={handlePositionChange}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                isDragover={dragoverRow === 10}
                usedPositions={getUsedPositions()}
              />
            </tbody>
          </table>
        </div>

      </div>

      {/* 오른쪽: 선수 목록 */}
      <div className="players-section">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">선수 목록</h3>
        </div>
        
        {/* 검색 및 필터 */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="선수 이름 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title="검색어 지우기"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {positionOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={attendanceFilter}
                onChange={(e) => setAttendanceFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {attendanceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* 선수 목록 */}
        <div className="players-list">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map(player => (
              <PlayerCard
                key={player.id}
                player={player}
                onDragStart={setDraggedPlayer}
                isInLineup={getPlayerLineupStatus(player.id) !== 'none'}
                lineupStatus={getPlayerLineupStatus(player.id)}
                isPresent={attendance[player.id] || false}
                onAttendanceChange={handleAttendanceChange}
                disabled={!attendance[player.id]}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>검색 조건에 맞는 선수가 없습니다</p>
            </div>
          )}
        </div>
        
        {/* 통계 정보 */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <div className="flex justify-between">
              <span>전체 선수:</span>
              <span className="font-medium">{players?.length || 0}명</span>
            </div>
            <div className="flex justify-between">
              <span>출석 선수:</span>
              <span className="font-medium">{Object.values(attendance).filter(present => present).length}명</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
