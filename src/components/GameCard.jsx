import { humanizeDate } from '../utils/date'

function GameCard({ game, onJoin, featured }) {
  const isFull = game.filled >= game.total
  const percent = Math.round((game.filled / game.total) * 100)
  const spotsState = isFull ? 'full' : percent >= 75 ? 'warning' : 'ok'

  return (
    <li
      className={`game-card${isFull ? ' game-card--full' : ''}${
        featured ? ' game-card--featured' : ''
      }`}
    >
      {featured && !isFull && (
        <span className="game-featured-tag">Ближайшая игра</span>
      )}

      <div className="game-card-top">
        <span className="game-pill game-pill--format">{game.format}</span>
        <span className="game-pill game-pill--level">{game.level}</span>
        {isFull && <span className="game-badge">Мест нет</span>}
      </div>

      <div className="game-place">{game.place}</div>
      <div className="game-datetime">
        <span className="game-date">{humanizeDate(game.date)}</span>
        <span className="game-time">{game.time}</span>
      </div>
      <div className="game-price">{game.price} ₸ / чел.</div>

      <div className="spots">
        <div className="spots-bar">
          <div
            className={`spots-bar-fill spots-bar-fill--${spotsState}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className={`spots-count spots-count--${spotsState}`}>
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
