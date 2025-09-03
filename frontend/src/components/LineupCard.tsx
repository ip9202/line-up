import { Player } from '../types'

interface LineupCardProps {
  battingOrder: number
  player?: Player
  position?: string
  onDrop: (battingOrder: number, player: Player) => void
  onRemove: (battingOrder: number) => void
}

export default function LineupCard({ battingOrder, player, position, onDrop, onRemove }: LineupCardProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const playerData = JSON.parse(e.dataTransfer.getData('player'))
    onDrop(battingOrder, playerData)
  }

  return (
    <tr
      className="lineup-row"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <td className="batting-order-cell">
        {battingOrder === 10 ? 'P' : `${battingOrder}번`}
      </td>
      <td className="position-cell">
        {player ? (
          <span className="position-badge">{position}</span>
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
          <span className="player-number">#{player.number || '?'}</span>
        ) : (
          <span className="empty-number">-</span>
        )}
      </td>
    </tr>
  )
}
