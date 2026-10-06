import { useState } from 'react'
import { humanizeDate } from '../utils/date'
import { displayName } from '../utils/user'

function GameCard({
  game,
  user,
  isOwner,
  onJoin,
  onCancel,
  onShowAuth,
  featured,
}) {
  const [isJoining, setIsJoining] = useState(false)
  const [name, setName] = useState('')
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const isFull = game.participants.length >= game.total
  const percent = Math.round((game.participants.length / game.total) * 100)
  const spotsState = isFull ? 'full' : percent >= 75 ? 'warning' : 'ok'

  function startJoining() {
    setName(displayName(user))
    setIsJoining(true)
  }

  function handleJoinSubmit(e) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    onJoin(game.id, trimmedName)
    setName('')
    setIsJoining(false)
  }

  async function handleCancelConfirm() {
    setCancelError(null)
    setCancelling(true)
    const result = await onCancel(game.id)
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
        {isOwner && <span className="game-pill game-pill--mine">Твоя игра</span>}
        {isFull && <span className="game-badge">Мест нет</span>}
      </div>

      <div className="game-place">{game.place}</div>
      <div className="game-organizer">Организатор: {game.organizer_name}</div>
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
      ) : !user ? (
        <div className="join-gate">
          {/* Форма входа одна и живёт ниже на странице — кнопка к ней прокручивает. */}
          <button type="button" className="join-button" onClick={onShowAuth}>
            Войти, чтобы записаться
          </button>
        </div>
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
        <button className="join-button" onClick={startJoining}>
          Присоединиться
        </button>
      )}

      {isOwner &&
        (isCancelling ? (
          <div className="cancel-form">
            <p className="cancel-question">
              Точно отменить игру? Вернуть её будет нельзя.
            </p>
            <div className="join-form-actions">
              <button
                type="button"
                className="cancel-submit"
                onClick={handleCancelConfirm}
                disabled={cancelling}
              >
                {cancelling ? 'Отменяем…' : 'Да, отменить'}
              </button>
              <button
                type="button"
                className="join-cancel"
                onClick={() => {
                  setIsCancelling(false)
                  setCancelError(null)
                }}
              >
                Нет, оставить
              </button>
            </div>
            {cancelError && <p className="cancel-error">{cancelError}</p>}
          </div>
        ) : (
          <button
            type="button"
            className="cancel-toggle"
            onClick={() => setIsCancelling(true)}
          >
            Отменить игру
          </button>
        ))}
    </li>
  )
}

export default GameCard
