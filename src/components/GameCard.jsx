import { humanizeDate } from '../utils/date'

function GameCard({ game, onJoin }) {
  const isFull = game.filled >= game.total
  const percent = Math.round((game.filled / game.total) * 100)

  return (
    <li className={`game-card${isFull ? ' game-card--full' : ''}`}>
      <div className="game-card-top">
        <span className="game-sport">{game.sport}</span>
        {isFull && <span className="game-badge">Мест нет</span>}
      </div>

      <div className="game-place">{game.place}</div>
      <div className="game-datetime">
        {humanizeDate(game.date)}, {game.time}
      </div>
      <div className="game-price">{game.price} ₸ / чел.</div>

      <div className="spots">
        <div className="spots-bar">
          <div className="spots-bar-fill" style={{ width: `${percent}%` }} />
        </div>
        <span className="spots-count">
          {game.filled}/{game.total}
        </span>
      </div>

      <button
        className="join-button"
        disabled={isFull}
        onClick={() => onJoin(game.id)}
      >
        {isFull ? 'Мест нет' : 'Присоединиться'}
      </button>
    </li>
  )
}

export default GameCard
