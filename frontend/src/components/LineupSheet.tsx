import React from 'react'

interface Player {
  id: number
  name: string
  number?: number
  position?: string
  batting_order?: number
}

interface Game {
  id: number
  opponent_team?: {
    name: string
  }
  game_date: string
  venue?: {
    name: string
  }
  is_home: boolean
}

interface LineupPlayer {
  id: number
  player_id: number
  position: string
  batting_order: number
  is_starter: boolean
  player: Player
}

interface Lineup {
  id: number
  name: string
  game_id: number
  lineup_players: LineupPlayer[]
  game?: Game
}

interface LineupSheetProps {
  lineup: Lineup
  game: Game
  allPlayers: Player[]
  attendance?: { [playerId: number]: boolean }
  teamName?: string
  managerName?: string
}

export default function LineupSheet({ 
  lineup, 
  game, 
  allPlayers, 
  attendance = {},
  teamName = "우리팀",
  managerName = "감독"
}: LineupSheetProps) {
  // 라인업에 포함된 선수들 (타순별 정렬)
  const lineupPlayers = lineup.lineup_players
    .filter(lineupPlayer => lineupPlayer.batting_order > 0)
    .sort((a, b) => a.batting_order - b.batting_order)

  // 투수 (batting_order가 0인 선수)
  const pitcher = lineup.lineup_players.find(lineupPlayer => 
    lineupPlayer.batting_order === 0
  )

  // 경기 날짜 포맷팅
  const formatGameDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${month}.${day}(${dayOfWeek}) ${hours}:${minutes}`
  }

  // 포지션 한글명 변환
  const getPositionKorean = (position: string) => {
    const positionMap: { [key: string]: string } = {
      'P': '투수',
      'C': '포수',
      '1B': '1루수',
      '2B': '2루수',
      '3B': '3루수',
      'SS': '유격수',
      'LF': '좌익수',
      'CF': '중견수',
      'RF': '우익수',
      'DH': '지명타자'
    }
    return positionMap[position] || position
  }

  return (
    <>
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-sheet, .printable-sheet * {
            visibility: visible;
          }
          .printable-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            background: white;
            padding: 10mm;
            box-sizing: border-box;
            margin: 0;
            max-width: none;
            box-shadow: none;
          }
          @page {
            margin: 0 !important;
            size: A4 portrait !important;
          }
          .printable-sheet .grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 10px;
            height: auto;
          }
          .printable-sheet .lg\\:col-span-2 {
            grid-column: 1;
          }
          .printable-sheet .lg\\:col-span-1 {
            grid-column: 2;
          }
          .printable-sheet h1 {
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
          }
          .printable-sheet h2 {
            font-size: 0.9rem;
            margin-bottom: 0.3rem;
          }
          .printable-sheet th, .printable-sheet td {
            padding: 0.4rem 0.6rem;
            font-size: 0.7rem;
          }
          .printable-sheet .text-2xl {
            font-size: 1.2rem;
          }
          .printable-sheet .text-lg {
            font-size: 0.9rem;
          }
          .printable-sheet .text-sm {
            font-size: 0.7rem;
          }
          .printable-sheet .text-xs {
            font-size: 0.6rem;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      <div className="w-full max-w-4xl mx-auto bg-white p-6 shadow-lg printable-sheet">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">야구 라인업 시트</h1>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽 컬럼 - 경기정보 + 라인업 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 경기정보 */}
          <div className="bg-white border border-gray-300">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
              <h2 className="text-lg font-semibold text-gray-900">경기정보</h2>
            </div>
            <table className="w-full">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="px-4 py-3 w-24 font-medium text-gray-900 border-r border-gray-300">팀명</td>
                  <td className="px-4 py-3 text-gray-900 border-r border-gray-300">{teamName}</td>
                  <td className="px-4 py-3 w-24 font-medium text-gray-900 border-r border-gray-300">감독</td>
                  <td className="px-4 py-3 text-gray-900">{managerName}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 w-24 font-medium text-gray-900 border-r border-gray-300">날짜</td>
                  <td className="px-4 py-3 text-gray-900 border-r border-gray-300">{formatGameDate(game.game_date)}</td>
                  <td className="px-4 py-3 w-24 font-medium text-gray-900 border-r border-gray-300">구장</td>
                  <td className="px-4 py-3 text-gray-900">{game.venue?.name || '미정'}</td>
                </tr>
                <tr className="border-t border-gray-300">
                  <td className="px-4 py-3 w-24 font-medium text-gray-900 border-r border-gray-300">vs 상대팀</td>
                  <td className="px-4 py-3 text-gray-900" colSpan={3}>{game.opponent_team?.name || '미정'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 라인업 */}
          <div className="bg-white border border-gray-300">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
              <h2 className="text-lg font-semibold text-gray-900 text-center">라인업</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="px-4 py-3 text-center font-medium text-gray-900 border-r border-gray-300">타순</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-900 border-r border-gray-300">포지션</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-900 border-r border-gray-300">이름</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-900">배번</th>
                </tr>
              </thead>
              <tbody>
                {lineupPlayers.map((lineupPlayer, index) => (
                  <tr key={lineupPlayer.id} className="border-b border-gray-300">
                    <td className="px-4 py-3 text-center font-medium text-gray-900 border-r border-gray-300">
                      {lineupPlayer.batting_order}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900 border-r border-gray-300">
                      {getPositionKorean(lineupPlayer.position)}
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-900 border-r border-gray-300">
                      {lineupPlayer.player?.name || '선수 없음'}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {lineupPlayer.player?.number || '-'}
                    </td>
                  </tr>
                ))}
                {/* 투수 */}
                {pitcher && (
                  <tr className="border-b border-gray-300">
                    <td className="px-4 py-3 text-center font-medium text-gray-900 border-r border-gray-300">
                      투수
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900 border-r border-gray-300">
                      선발
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-gray-900 border-r border-gray-300">
                      {pitcher.player?.name || '선수 없음'}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-900">
                      {pitcher.player?.number || '-'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 오른쪽 컬럼 - 선수목록 */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-300">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
              <h2 className="text-lg font-semibold text-gray-900 text-center">선수목록</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="px-4 py-3 text-center font-medium text-gray-900 border-r border-gray-300">번호</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-900 border-r border-gray-300">성명</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-900 border-r border-gray-300">배번</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-900">비고</th>
                </tr>
              </thead>
              <tbody>
                {allPlayers.map((player, index) => {
                  const isPresent = attendance[player.id] || false
                  return (
                    <tr key={player.id} className="border-b border-gray-300">
                      <td className="px-4 py-3 text-center text-gray-900 border-r border-gray-300">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-gray-900 border-r border-gray-300">
                        {player.name}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900 border-r border-gray-300">
                        {player.number || '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-900">
                        {isPresent ? 'V' : '-'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
