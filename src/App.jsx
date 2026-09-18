import { useEffect, useRef, useState } from 'react'
import GameList from './components/GameList'
import { humanizeDate } from './utils/date'
import { buildWhatsAppLink } from './utils/whatsapp'
import { generateCancelCode, hashCancelCode } from './utils/cancelCode'
import { supabase, supabaseConfigError } from './lib/supabaseClient'
import './App.css'

const FORMATS = ['5x5', '6x6', '7x7', '8x8']
const LEVELS = ['Любой', 'Начинающий', 'Средний', 'Опытный']

function App() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [joinedGame, setJoinedGame] = useState(null)
  const [createdCode, setCreatedCode] = useState(null)
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef(null)

  const [place, setPlace] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [price, setPrice] = useState('')
  const [total, setTotal] = useState('')
  const [format, setFormat] = useState(FORMATS[0])
  const [level, setLevel] = useState(LEVELS[0])
  const [organizerName, setOrganizerName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  useEffect(() => {
    if (supabaseConfigError) {
      setLoadError(supabaseConfigError)
      setLoading(false)
      return
    }

    loadGames()
  }, [])

  async function loadGames() {
    setLoading(true)
    setLoadError(null)

    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (error) {
      setLoadError('Не получилось загрузить игры. Попробуй обновить страницу.')
    } else {
      setGames(data)
    }
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)

    const cancelCode = generateCancelCode()
    const cancelCodeHash = await hashCancelCode(cancelCode)

    const { data, error } = await supabase
      .from('games')
      .insert({
        place,
        date,
        time,
        price: Number(price),
        total: Number(total),
        format,
        level,
        organizer_name: organizerName,
        organizer_whatsapp: whatsapp,
        participants: [],
        cancel_code_hash: cancelCodeHash,
      })
      .select()
      .single()

    setSubmitting(false)

    if (error) {
      setFormError('Не получилось создать игру. Попробуй ещё раз.')
      return
    }

    setGames((prevGames) =>
      [...prevGames, data].sort((a, b) =>
        `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
      )
    )
    setCreatedCode(cancelCode)

    setPlace('')
    setDate('')
    setTime('')
    setPrice('')
    setTotal('')
    setFormat(FORMATS[0])
    setLevel(LEVELS[0])
    setOrganizerName('')
    setWhatsapp('')
  }

  async function handleJoin(id, name) {
    const trimmedName = name.trim()
    if (!trimmedName) return

    const game = games.find((g) => g.id === id)
    if (!game || game.participants.length >= game.total) return

    setFormError(null)

    const { data, error } = await supabase
      .from('games')
      .update({ participants: [...game.participants, trimmedName] })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      setFormError('Не получилось записаться. Попробуй ещё раз.')
      return
    }

    setGames((prevGames) => prevGames.map((g) => (g.id === id ? data : g)))
    setJoinedGame(data)
  }

  async function handleCancelGame(id, code) {
    const { data, error } = await supabase.rpc('cancel_game', {
      p_game_id: id,
      p_code: code,
    })

    if (error) {
      return { ok: false, message: 'Не получилось отменить игру. Попробуй ещё раз.' }
    }

    if (!data) {
      return { ok: false, message: 'Неверный код отмены.' }
    }

    setGames((prevGames) => prevGames.filter((g) => g.id !== id))
    return { ok: true }
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="page">
      <header className="site-header">
        <div className="brand-row">
          <h1 className="brand-logo">
            <span className="brand-icon" aria-hidden="true">
              ⚽
            </span>
            Сыграем
          </h1>
          <span className="brand-domain">sygraem.kz</span>
        </div>
        <p className="site-tagline">
          Уличный футбол в Алматы — найди игру рядом и запишись за пару кликов
        </p>
      </header>

      {supabaseConfigError ? (
        <p className="status-message status-message--error">
          {supabaseConfigError}
        </p>
      ) : createdCode ? (
        <div className="confirmation">
          <h2>Игра создана!</h2>
          <p className="confirmation-line">Код отмены игры:</p>
          <p className="cancel-code">{createdCode}</p>
          <p className="confirmation-note">
            Сохрани этот код — без него отменить игру будет нельзя. Мы
            показываем его только один раз и нигде больше не храним в
            открытом виде.
          </p>
          <button
            className="primary-button"
            onClick={() => setCreatedCode(null)}
          >
            Понятно, к играм
          </button>
        </div>
      ) : joinedGame ? (
        <div className="confirmation">
          <h2>Готово, ты записан!</h2>
          <p className="confirmation-line">{joinedGame.place}</p>
          <p className="confirmation-line">
            {humanizeDate(joinedGame.date)}, {joinedGame.time}
          </p>
          <p className="confirmation-line">
            {joinedGame.format} · {joinedGame.level}
          </p>
          <p className="confirmation-line">{joinedGame.price} ₸ / чел.</p>
          <p className="confirmation-organizer">
            Организатор: {joinedGame.organizer_name}
          </p>

          <a
            className="whatsapp-button"
            href={buildWhatsAppLink(joinedGame.organizer_whatsapp)}
            target="_blank"
            rel="noreferrer"
          >
            💬 Написать в WhatsApp
          </a>

          <p className="confirmation-note">
            Все детали игры — сбор, замены, отмена — обсуждаются в чате с
            организатором.
          </p>

          <button
            className="primary-button"
            onClick={() => setJoinedGame(null)}
          >
            Назад к играм
          </button>
        </div>
      ) : (
        <>
          {loading && <p className="status-message">Загружаем игры…</p>}

          {loadError && (
            <p className="status-message status-message--error">
              {loadError}
            </p>
          )}

          {!loading && !loadError && (
            <GameList
              games={games}
              onJoin={handleJoin}
              onCancel={handleCancelGame}
              onCreateClick={scrollToForm}
            />
          )}

          <h2>Создать игру</h2>

          {formError && (
            <p className="status-message status-message--error">
              {formError}
            </p>
          )}

          <form className="game-form" ref={formRef} onSubmit={handleSubmit}>
            <label>
              Место
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                required
              />
            </label>

            <label>
              Дата
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </label>

            <label>
              Время
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </label>

            <label>
              Формат игры
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                {FORMATS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Уровень
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                {LEVELS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Цена за человека, ₸
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </label>

            <label>
              Всего мест
              <input
                type="number"
                min="1"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                required
              />
            </label>

            <label>
              Твоё имя (организатор)
              <input
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                required
              />
            </label>

            <label>
              WhatsApp группы или твой номер
              <input
                type="text"
                placeholder="Ссылка на группу или номер телефона"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
              />
            </label>

            <button type="submit" disabled={submitting}>
              {submitting ? 'Добавляем…' : 'Добавить игру'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}

export default App
