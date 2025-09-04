import { useState } from 'react'
import { Player } from '../types'

interface PlayerCardProps {
  player: Player
  onDragStart: (player: Player) => void
  disabled?: boolean
  isInLineup?: boolean
  lineupStatus?: 'none' | 'batter' | 'pitcher' | 'both'
  isPresent?: boolean
  onAttendanceChange?: (playerId: number, isPresent: boolean) => void
}

export default function PlayerCard({ 
  player, 
  onDragStart, 
  disabled = false, 
  isInLineup = false, 
  lineupStatus = 'none',
  isPresent = false,
  onAttendanceChange
}: PlayerCardProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    if (disabled) {
      e.preventDefault()
      return
    }
    e.dataTransfer.setData('player', JSON.stringify(player))
    e.dataTransfer.effectAllowed = 'move'
    setIsDragging(true)
    onDragStart(player)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }


  const getLineupStatusClass = () => {
    switch (lineupStatus) {
      case 'batter':
      case 'pitcher':
        return 'in-lineup'
      case 'both':
        return 'in-lineup-both'
      default:
        return ''
    }
  }

  return (
    <div
      className={`player-card ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''} ${getLineupStatusClass()}`}
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="player-card-header">
        <span className="player-number">{player.number || '?'}</span>
        {player.is_professional && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
            선수출신
          </span>
        )}
      </div>
      
      <div className="player-name">{player.name}</div>
      
      <div className="player-details">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPresent}
            onChange={(e) => onAttendanceChange?.(player.id, e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-gray-600">출석</span>
        </label>
      </div>
    </div>
  )
}
