import { useState } from 'react'
import { humanizeDate } from '../utils/date'

function GameCard({ game, onJoin, onCancel, featured }) {
  const [isJoining, setIsJoining] = useState(false)
  const [name, setName] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelCode, setCancelCode] = useState('')
  const [cancelError, setCancelError] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const isFull = game.participants.length >= game.total
  const percent = Math.round((game.participants.length / game.total) * 100)
  const spotsState = isFull ? 'full' : percent >= 75 ? 'warning' : 'ok'

  function handleJoinSubmit(e) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    onJoin(game.id, trimmedName)
    setName('')
    setIsJoining(false)
  }

  async function handleCancelSubmit(e) {
    e.preventDefault()
    const trimmedCode = cancelCode.trim()
    if (!trimmedCode) return

    setCancelError(null)
    setCancelling(true)
    const result = await onCancel(game.id, trimmedCode)
    setCancelling(false)

    if (!result.ok) {
      setCancelError(result.message)
    }
  }

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
      <div className="game-organizer">
        Организатор: {game.organizer_name}
      </div>
      <div className="game-datetime">
        <span className="game-date">{humanizeDate(game.date)}</span>
        <span className="game-time">{game.time}</span>
      </div>
      <div className="game-price">{game.price} ₸ / чел.</div>

      {game.participants.length > 0 && (
        <div className="game-participants">
          Уже играют: {game.participants.join(', ')}
        </div>
      )}

      <div className="spots">
        <div className="spots-bar">
          <div
            className={`spots-bar-fill spots-bar-fill--${spotsState}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className={`spots-count spots-count--${spotsState}`}>
          {game.participants.length}/{game.total}
        </span>
      </div>

      {isFull ? (
        <button className="join-button" disabled>
          Мест нет
        </button>
      ) : isJoining ? (
        <form className="join-form" onSubmit={handleJoinSubmit}>
          <input
            type="text"
            placeholder="Твоё имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <div className="join-form-actions">
            <button type="submit" className="join-button">
              Записаться
            </button>
            <button
              type="button"
              className="join-cancel"
              onClick={() => {
                setIsJoining(false)
                setName('')
              }}
            >
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <button className="join-button" onClick={() => setIsJoining(true)}>
          Присоединиться
        </button>
      )}

      {isCancelling ? (
        <form className="cancel-form" onSubmit={handleCancelSubmit}>
          <input
            type="text"
            placeholder="Код отмены"
            value={cancelCode}
            onChange={(e) => setCancelCode(e.target.value)}
            required
            autoFocus
          />
          <div className="join-form-actions">
            <button type="submit" className="cancel-submit" disabled={cancelling}>
              {cancelling ? 'Отменяем…' : 'Отменить игру'}
            </button>
            <button
              type="button"
              className="join-cancel"
              onClick={() => {
                setIsCancelling(false)
                setCancelCode('')
                setCancelError(null)
              }}
            >
              Закрыть
            </button>
          </div>
          {cancelError && <p className="cancel-error">{cancelError}</p>}
        </form>
      ) : (
        <button
          type="button"
          className="cancel-toggle"
          onClick={() => setIsCancelling(true)}
        >
          Отменить игру
        </button>
      )}
    </li>
  )
}

export default GameCard
