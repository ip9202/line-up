import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLineup } from '../hooks/useLineups'
import { useGames } from '../hooks/useGames'
import { usePlayers } from '../hooks/usePlayers'
import { useTeams } from '../hooks/useTeams'
import { useAuth } from '../contexts/AuthContext'
import api from '@/lib/api'
import LineupSheet from '../components/LineupSheet'
import { ArrowLeft, Printer } from 'lucide-react'

export default function LineupSheetPage() {
  const { lineupId } = useParams<{ lineupId: string }>()
  const navigate = useNavigate()
  const [attendance, setAttendance] = useState<{ [playerId: number]: boolean }>({})
  
  const { data: lineup, isLoading: lineupLoading } = useLineup(parseInt(lineupId || '0'))
  const { data: games, isLoading: gamesLoading } = useGames()
  const { data: players, isLoading: playersLoading } = usePlayers()
  const { data: teams } = useTeams()
  const { user } = useAuth()

  // 선택된 라인업의 경기 정보
  const selectedGame = lineup?.game || games?.find(g => g.id === lineup?.game_id)
  
  // 우리팀 찾기
  const ourTeam = teams?.find(team => team.is_our_team)

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
    console.log('프린트 버튼 클릭됨!')
    
    // 데이터가 로드되지 않았으면 경고
    if (!lineup || !selectedGame || !players) {
      console.log('데이터 로딩 중:', { lineup: !!lineup, selectedGame: !!selectedGame, players: !!players })
      alert('데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

              console.log('프린트 데이터 확인:', {
            lineup,
            selectedGame,
            players,
            ourTeam
          })
          
          console.log('선수 데이터 상세:', players?.map(p => ({
            id: p.id,
            name: p.name,
            number: p.number,
            numberType: typeof p.number
          })))
    
    // 감독 찾기 테스트
    const managerPlayer = players.find(p => p.role === '감독')
    console.log('감독 선수 찾기:', { managerPlayer, allRoles: players.map(p => p.role) })
    
    // 라인업 선수들 확인
    console.log('라인업 선수들:', lineup.lineup_players?.map(lp => {
      const player = players.find(p => p.id === lp.player_id)
      return {
        batting_order: lp.batting_order,
        name: player?.name,
        number: player?.number,
        position: lp.position
      }
    }))

    // 라인업 시트 컴포넌트만 새창으로 띄우기
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    
    if (printWindow) {
      // 실제 데이터 값들 미리 계산
      const teamName = ourTeam?.name || "우리팀"
      const managerName = players?.find(p => p.role === '감독')?.name || '감독'
      const gameDate = selectedGame?.game_date ? (() => {
        const date = new Date(selectedGame.game_date)
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${month}월${day}일 ${hours}:${minutes}`
      })() : ''
      const venueName = selectedGame?.venue?.name || '미정'
      const opponentName = selectedGame?.opponent_team?.name || '상대팀'

      // 라인업 시트 HTML 생성
      const lineupSheetHTML = `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>야구 라인업 시트</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: white;
              color: black;
            }
            .printable-sheet {
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              background: white;
            }
            .text-center {
              text-align: center;
              margin-bottom: 20px;
            }
            .print-button {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              background: #2563eb;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              cursor: pointer;
              margin-top: 10px;
              transition: background-color 0.2s;
            }
            .print-button svg {
              width: 16px;
              height: 16px;
            }
            .print-button:hover {
              background: #1d4ed8;
            }
            @media print {
              .print-button {
                display: none !important;
              }
            }
            h1 {
              font-size: 24px;
              font-weight: bold;
              color: black;
              margin-bottom: 10px;
            }
            .grid {
              display: grid;
              grid-template-columns: 1.5fr 1fr;
              gap: 20px;
              align-items: start;
            }
            .left-column {
              grid-column: 1;
            }
            .right-column {
              grid-column: 2;
            }
            @media print {
              .grid {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 10px;
                align-items: start;
              }
              .left-column {
                grid-column: 1;
              }
              .right-column {
                grid-column: 2;
              }
            }
            .section {
              margin-bottom: 30px;
            }
            h2 {
              font-size: 18px;
              font-weight: 600;
              color: black;
              margin-bottom: 10px;
              padding: 8px 16px;
              background: #f5f5f5;
              border-bottom: 1px solid #d1d5db;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #d1d5db;
            }
            th, td {
              padding: 14px 12px;
              text-align: left;
              border: 1px solid #d1d5db;
              font-size: 14px;
              color: black;
              background: white;
              line-height: 1.5;
            }
            th {
              background: #f9fafb;
              font-weight: 600;
            }
            .text-sm {
              font-size: 12px;
            }
            .text-xs {
              font-size: 10px;
            }
            .font-medium {
              font-weight: 500;
            }
            .font-bold {
              font-weight: 700;
            }
            .text-gray-900 {
              color: black;
            }
            .border-r {
              border-right: 1px solid #d1d5db;
            }
            .border-b {
              border-bottom: 1px solid #d1d5db;
            }
            .border-t {
              border-top: 1px solid #d1d5db;
            }
            .px-4 {
              padding-left: 16px;
              padding-right: 16px;
            }
            .py-3 {
              padding-top: 12px;
              padding-bottom: 12px;
            }
            @media print {
              .px-4 {
                padding-left: 14px !important;
                padding-right: 14px !important;
              }
              .py-3 {
                padding-top: 14px !important;
                padding-bottom: 14px !important;
              }
            }
            .w-24 {
              width: 96px;
            }
            .game-info-table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #d1d5db;
            }
            .game-info-table td {
              padding: 10px 12px;
              text-align: left;
              border: 1px solid #d1d5db;
              font-size: 12px;
              color: black;
              background: white;
              line-height: 1.4;
            }
            .game-info-table .label-cell {
              background: #f9fafb;
              font-weight: 600;
              text-align: center;
            }
            .game-info-table .value-cell {
              background: white;
              text-align: left;
            }
            .col-span-2 {
              grid-column: span 2;
            }
            .col-span-3 {
              grid-column: span 3;
            }
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body {
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }
              .printable-sheet {
                padding: 5mm !important;
                max-width: none !important;
                width: 100% !important;
                height: auto !important;
                min-height: 100vh !important;
                background: white !important;
                margin: 0 !important;
                box-shadow: none !important;
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
                page-break-before: avoid !important;
              }
              .grid {
                display: grid !important;
                grid-template-columns: 1.5fr 1fr !important;
                gap: 8px !important;
                align-items: start !important;
                page-break-inside: avoid !important;
              }
              .left-column {
                grid-column: 1 !important;
                page-break-inside: avoid !important;
              }
              .right-column {
                grid-column: 2 !important;
                page-break-inside: avoid !important;
              }
              .section {
                margin-bottom: 40px !important;
                page-break-inside: avoid !important;
              }
              h1 {
                font-size: 32px !important;
                margin: 0 0 20px 0 !important;
                padding: 0 !important;
                color: black !important;
              }
              h2 {
                font-size: 24px !important;
                margin: 0 0 20px 0 !important;
                padding: 12px 16px !important;
                color: black !important;
                background: #f5f5f5 !important;
              }
              table {
                width: 100% !important;
                border-collapse: collapse !important;
                page-break-inside: avoid !important;
              }
              th, td {
                padding: 20px 14px !important;
                font-size: 18px !important;
                color: black !important;
                background: white !important;
                border: 1px solid #000 !important;
                line-height: 1.8 !important;
              }
              th {
                background: #f9f9f9 !important;
                font-weight: 600 !important;
              }
              .text-center {
                text-align: center !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              .game-info-table {
                width: 100% !important;
                border-collapse: collapse !important;
                border: 1px solid #d1d5db !important;
              }
              .game-info-table td {
                background: white !important;
                color: black !important;
                border: 1px solid #d1d5db !important;
                padding: 14px 10px !important;
                font-size: 18px !important;
                line-height: 1.8 !important;
              }
              .game-info-table .label-cell {
                background: #f9fafb !important;
                font-weight: 600 !important;
                text-align: center !important;
              }
              .game-info-table .value-cell {
                background: white !important;
                text-align: left !important;
              }
              @page {
                margin: 0 !important;
                size: A4 portrait !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="printable-sheet">
            <div class="text-center mb-4">
              <button onclick="window.print()" class="print-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect width="12" height="8" x="6" y="14"></rect>
                </svg>
                프린트
              </button>
            </div>
            
            <div class="grid">
              <div class="left-column">
                <div class="section">
                  <h2>경기정보</h2>
                  <table class="game-info-table">
                    <tbody>
                      <tr>
                        <td class="px-4 py-3 w-24 label-cell">팀명</td>
                        <td class="px-4 py-3 value-cell">${teamName}</td>
                        <td class="px-4 py-3 w-24 label-cell">감독</td>
                        <td class="px-4 py-3 value-cell">${managerName}</td>
                      </tr>
                      <tr>
                        <td class="px-4 py-3 w-24 label-cell">날짜</td>
                        <td class="px-4 py-3 value-cell">${gameDate}</td>
                        <td class="px-4 py-3 w-24 label-cell">구장</td>
                        <td class="px-4 py-3 value-cell">${venueName}</td>
                      </tr>
                      <tr>
                        <td class="px-4 py-3 w-24 label-cell">vs 상대팀</td>
                        <td class="px-4 py-3 value-cell" colspan="3">${opponentName}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div class="section">
                  <h2>라인업</h2>
                  <table>
                    <thead>
                      <tr>
                        <th class="px-4 py-3 text-center">타순</th>
                        <th class="px-4 py-3 text-center">포지션</th>
                        <th class="px-4 py-3 text-center">이름</th>
                        <th class="px-4 py-3 text-center">배번</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${lineup.lineup_players
                        ?.filter(lp => lp.batting_order > 0)
                        .sort((a, b) => a.batting_order - b.batting_order)
                        .map(lp => {
                          const player = players.find(p => p.id === lp.player_id)
                          const positionMap = {
                            'P': '투수', 'C': '포수', '1B': '1루수', '2B': '2루수', '3B': '3루수',
                            'SS': '유격수', 'LF': '좌익수', 'CF': '중견수', 'RF': '우익수', 'DH': '지명타자'
                          }
                          return `
                            <tr>
                              <td class="px-4 py-3 text-center font-medium">${lp.batting_order}</td>
                              <td class="px-4 py-3 text-center">${positionMap[lp.position] || lp.position}</td>
                              <td class="px-4 py-3 text-center">${player?.name || ''}</td>
                              <td class="px-4 py-3 text-center">${player?.number || ''}</td>
                            </tr>
                          `
                        }).join('') || ''}
                      ${lineup.lineup_players?.find(lp => lp.batting_order === 0) ? `
                        <tr class="border-t">
                          <td class="px-4 py-3 text-center font-medium">투수</td>
                          <td class="px-4 py-3 text-center">선발</td>
                          <td class="px-4 py-3 text-center">${players.find(p => p.id === lineup.lineup_players.find(lp => lp.batting_order === 0)?.player_id)?.name || ''}</td>
                          <td class="px-4 py-3 text-center">${players.find(p => p.id === lineup.lineup_players.find(lp => lp.batting_order === 0)?.player_id)?.number || ''}</td>
                        </tr>
                      ` : ''}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div class="right-column">
                <div class="section">
                  <h2>선수목록</h2>
                  <table>
                    <thead>
                      <tr>
                        <th class="px-4 py-3 text-center">번호</th>
                        <th class="px-4 py-3 text-center">성명</th>
                        <th class="px-4 py-3 text-center">배번</th>
                        <th class="px-4 py-3 text-center">비고</th>
                      </tr>
                    </thead>
                                              <tbody>
                            ${Array.from({ length: 27 }, (_, index) => {
                              const playerNumber = index + 1
                              const player = players.find(p => Number(p.number) === playerNumber)
                              const isInLineup = player ? lineup.lineup_players?.some(lp => lp.player_id === player.id) : false
                              return `
                                <tr>
                                  <td class="px-4 py-3 text-center">${playerNumber}</td>
                                  <td class="px-4 py-3 text-center">${player?.name || ''}</td>
                                  <td class="px-4 py-3 text-center">${player?.number || ''}</td>
                                  <td class="px-4 py-3 text-center">${isInLineup ? 'V' : ''}</td>
                                </tr>
                              `
                            }).join('')}
                          </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
      
      printWindow.document.write(lineupSheetHTML)
      printWindow.document.close()
    }
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

  if (!lineup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">라인업을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">요청하신 라인업이 존재하지 않거나 삭제되었습니다.</p>
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
      <div className="space-y-6 p-6">
        {/* 헤더 카드 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  if (user?.role === '감독') {
                    navigate(`/lineup/editor?gameId=${lineup?.game_id}`)
                  } else {
                    navigate('/games')
                  }
                }}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>{user?.role === '감독' ? '라인업 편집' : '경기 관리'}</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  vs {selectedGame?.opponent_team?.name || '상대팀'}
              </h1>
                <p className="text-gray-600">
                  {selectedGame?.game_date ? new Date(selectedGame.game_date).toLocaleString('ko-KR', { 
                    year: 'numeric', 
                    month: 'numeric', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '경기일시'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Printer className="h-4 w-4" />
                <span>프린트보기</span>
              </button>
          </div>
        </div>
      </div>

        {/* 라인업 시트 카드 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <LineupSheet
          lineup={lineup}
          game={selectedGame}
          allPlayers={players}
          attendance={attendance}
            teamName={ourTeam?.name || "우리팀"}
            managerName={players?.find(p => p.role === '감독')?.name || "감독"}
        />
        </div>
      </div>
    </div>
  )
}
