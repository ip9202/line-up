import { Player } from '../types'

interface LineupCardProps {
  battingOrder: number
  player?: Player
  position?: string
  onDrop: (battingOrder: number, player: Player) => void
  onRemove: (battingOrder: number) => void
  onPositionChange?: (battingOrder: number, position: string) => void
  onDragOver?: (e: React.DragEvent, battingOrder: number) => void
  onDragLeave?: () => void
  isDragover?: boolean
  usedPositions?: string[]
}

export default function LineupCard({ 
  battingOrder, 
  player, 
  position, 
  onDrop, 
  onRemove, 
  onPositionChange,
  onDragOver, 
  onDragLeave, 
  isDragover,
  usedPositions = []
}: LineupCardProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    onDragOver?.(e, battingOrder)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const playerData = JSON.parse(e.dataTransfer.getData('player'))
    onDrop(battingOrder, playerData)
  }

  const handleDragLeave = () => {
    onDragLeave?.()
  }

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPositionChange?.(battingOrder, e.target.value)
  }

  // 포지션 옵션들
  const positionOptions = [
    { value: '', label: '포지션 선택' },
    { value: '1B', label: '1B' },
    { value: '2B', label: '2B' },
    { value: '3B', label: '3B' },
    { value: 'SS', label: 'SS' },
    { value: 'LF', label: 'LF' },
    { value: 'CF', label: 'CF' },
    { value: 'RF', label: 'RF' },
    { value: 'DH', label: 'DH' },
    { value: 'C', label: 'C' },
    { value: 'P', label: 'P' }
  ]

  // 사용 가능한 포지션 필터링 (현재 포지션은 제외)
  const availablePositions = positionOptions.filter(option => {
    // 빈 값(포지션 선택)은 항상 포함
    if (option.value === '') return true
    
    // 현재 포지션은 항상 포함
    if (option.value === position) return true
    
    // P 포지션은 타자(1-9번)에서도 선택 가능 (투수와 중복 허용)
    if (option.value === 'P') return true
    
    // 다른 포지션은 중복 체크
    return !usedPositions.includes(option.value)
  })

  return (
    <tr
      className={`lineup-row ${isDragover ? 'dragover' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
    >
      <td className="batting-order-cell">
        {battingOrder === 0 ? '선발' : battingOrder}
      </td>
      <td className="position-cell">
        {player ? (
          battingOrder === 0 ? (
            // 투수는 포지션 선택 없이 선발로 고정
            <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded font-medium">
              선발
            </span>
          ) : (
            // 타자는 모든 포지션 선택 가능 (P 포함)
            <select
              value={position || ''}
              onChange={handlePositionChange}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availablePositions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )
        ) : (
          <span className="empty-position">-</span>
        )}
      </td>
      <td className="name-cell">
        {player ? (
          <div className="player-info">
            <span className="player-name">{player.name}</span>
            {player && (
              <button
                className="remove-btn"
                onClick={() => onRemove(battingOrder)}
                title="제거"
              >
                ×
              </button>
            )}
          </div>
        ) : (
          <span className="empty-name">-</span>
        )}
      </td>
      <td className="number-cell">
        {player ? (
          <span className="player-number">{player.number || '?'}</span>
        ) : (
          <span className="empty-number">-</span>
        )}
      </td>
    </tr>
  )
}
