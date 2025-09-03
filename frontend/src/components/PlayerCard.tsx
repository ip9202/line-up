import { Player } from '../types'

interface PlayerCardProps {
  player: Player
  onDragStart: (player: Player) => void
}

export default function PlayerCard({ player, onDragStart }: PlayerCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('player', JSON.stringify(player))
    onDragStart(player)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case '감독': return 'bg-red-100 text-red-800'
      case '코치': return 'bg-orange-100 text-orange-800'
      case '회장': return 'bg-purple-100 text-purple-800'
      case '총무': return 'bg-blue-100 text-blue-800'
      case '고문': return 'bg-gray-100 text-gray-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  return (
    <div
      className="player-card"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="player-card-header">
        <span className="player-number">#{player.number || '?'}</span>
        <span className={`role-badge ${getRoleColor(player.role)}`}>
          {player.role}
        </span>
      </div>
      
      <div className="player-name">{player.name}</div>
      
      <div className="player-details">
        {player.position_preference && (
          <span className="position-preference">
            {player.position_preference}
          </span>
        )}
        {player.age && (
          <span className="age">{player.age}세</span>
        )}
      </div>
    </div>
  )
}
