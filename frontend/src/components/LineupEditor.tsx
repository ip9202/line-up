import { useState, useEffect } from 'react'
import { usePlayers, useLineup, useAddPlayerToLineup, useRemovePlayerFromLineup } from '../hooks/useLineups'
import { usePlayers as usePlayersList } from '../hooks/usePlayers'
import { Player } from '../types'
import LineupCard from './LineupCard'
import PlayerCard from './PlayerCard'

interface LineupEditorProps {
  lineupId: number
}

export default function LineupEditor({ lineupId }: LineupEditorProps) {
  const [draggedPlayer, setDraggedPlayer] = useState<Player | null>(null)
  const [lineupData, setLineupData] = useState<{ [key: number]: { player: Player; position: string } }>({})

  const { data: lineup, isLoading: lineupLoading } = useLineup(lineupId)
  const { data: players, isLoading: playersLoading } = usePlayersList()
  const addPlayerMutation = useAddPlayerToLineup()
  const removePlayerMutation = useRemovePlayerFromLineup()

  // 라인업 데이터 초기화
  useEffect(() => {
    if (lineup) {
      const initialData: { [key: number]: { player: Player; position: string } } = {}
      lineup.lineup_players.forEach(lp => {
        const player = players?.find(p => p.id === lp.player_id)
        if (player) {
          // 투수는 별도로 10번으로 처리
          if (lp.position === 'P') {
            initialData[10] = {
              player,
              position: 'P'
            }
          } else {
            // 일반 타순 선수들
            initialData[lp.batting_order] = {
              player,
              position: lp.position
            }
          }
        }
      })
      setLineupData(initialData)
    }
  }, [lineup, players])

  const handlePlayerDrop = async (battingOrder: number, player: Player) => {
    try {
      // 기존 선수가 있으면 제거
      if (lineupData[battingOrder]) {
        const existingLineupPlayer = lineup?.lineup_players.find(
          lp => (battingOrder === 10 && lp.position === 'P') || lp.batting_order === battingOrder
        )
        if (existingLineupPlayer) {
          await removePlayerMutation.mutateAsync({
            lineupId,
            lineupPlayerId: existingLineupPlayer.id
          })
        }
      }

      // 투수인 경우 특별 처리
      const isPitcher = battingOrder === 10
      let position, actualBattingOrder

      if (isPitcher) {
        // 투수는 포지션 P, 타순은 0 (투수 전용)
        position = 'P'
        actualBattingOrder = 0
      } else {
        // 일반 선수는 선호 포지션 또는 기본값, 실제 타순 사용
        position = player.position_preference || 'P'
        actualBattingOrder = battingOrder
      }

      // 새 선수 추가
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
    } catch (error) {
      console.error('선수 추가 실패:', error)
    }
  }

  const handlePlayerRemove = async (battingOrder: number) => {
    try {
      const lineupPlayer = lineup?.lineup_players.find(
        lp => (battingOrder === 10 && lp.position === 'P') || lp.batting_order === battingOrder
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

  if (lineupLoading || playersLoading) {
    return <div className="loading">로딩 중...</div>
  }

  return (
    <div className="lineup-editor-layout">
      {/* 왼쪽: 라인업 테이블 */}
      <div className="lineup-section">
        <div className="lineup-header">
          <h2 className="lineup-title">라인업</h2>
          <div className="lineup-info">
            <span className="game-info">{lineup?.name}</span>
          </div>
        </div>

        {/* 라인업 테이블 */}
        <div className="lineup-table-container">
          <table className="lineup-table">
            <thead>
              <tr>
                <th>타순</th>
                <th>위치</th>
                <th>성명</th>
                <th>배번</th>
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
                />
              ))}
              {/* 투수 행 추가 */}
              <LineupCard
                key={10}
                battingOrder={10}
                player={lineupData[10]?.player}
                position={lineupData[10]?.position}
                onDrop={handlePlayerDrop}
                onRemove={handlePlayerRemove}
              />
            </tbody>
          </table>
        </div>

        {/* 포지션 정보 */}
        <div className="position-info">
          <div className="info-section">
            <h3>포지션</h3>
            <div className="position-list">
              <div>P, C, 1B, 2B</div>
              <div>3B, SS, LF, CF</div>
              <div>RF, DH</div>
            </div>
          </div>
          
          <div className="info-section">
            <h3>타순</h3>
            <div>1번 ~ 9번</div>
          </div>
          
          <div className="info-section">
            <h3>상태</h3>
            <div>선발/교체</div>
          </div>
        </div>
      </div>

      {/* 오른쪽: 선수 목록 */}
      <div className="players-section">
        <h3>선수 목록</h3>
        <div className="players-list">
          {players?.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              onDragStart={setDraggedPlayer}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
