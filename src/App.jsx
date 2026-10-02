import { useEffect, useRef, useState } from 'react'
import GameList from './components/GameList'
import AuthBar, { GoogleButton } from './components/AuthBar'
import { humanizeDate, isUpcoming, todayIso } from './utils/date'
import { buildWhatsAppLink } from './utils/whatsapp'
import { displayName } from './utils/user'
import { supabase, supabaseConfigError } from './lib/supabaseClient'
import './App.css'

const FORMATS = ['5x5', '6x6', '7x7', '8x8']
const LEVELS = ['Любой', 'Начинающий', 'Средний', 'Опытный']

// Тексты ошибок, которые бросает функция join_game в базе.
const JOIN_ERRORS = {
  not_authenticated: 'Сначала войди через Google.',
  empty_name: 'Введи имя.',
  game_not_found: 'Эту игру уже отменили.',
  game_full: 'Мест больше нет.',
}

function joinErrorMessage(error) {
  const key = Object.keys(JOIN_ERRORS).find((code) =>
    error.message?.includes(code)
  )
  return key ? JOIN_ERRORS[key] : 'Не получилось записаться. Попробуй ещё раз.'
}

function App() {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [joinedGame, setJoinedGame] = useState(null)
  const [gameCreated, setGameCreated] = useState(false)
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
      setAuthReady(true)
      return
    }

    // Имя в форме подставляем из профиля Google, но если человек его уже
    // поправил — не перетираем.
    function applySession(session) {
      const nextUser = session?.user ?? null

      setUser(nextUser)
      setAuthReady(true)

      if (nextUser) {
        setOrganizerName((current) => current || displayName(nextUser))
      }
    }

    supabase.auth.getSession().then(({ data }) => applySession(data.session))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      applySession(session)
    )

    loadGames()

    return () => subscription.unsubscribe()
  }, [])

  async function loadGames() {
    setLoading(true)
    setLoadError(null)

    const { data, error } = await supabase
      .from('games')
      .select('*')
      .gte('date', todayIso())
      .order('date', { ascending: true })
      .order('time', { ascending: true })

    if (error) {
      setLoadError('Не получилось загрузить игры. Попробуй обновить страницу.')
    } else {
      setGames(data)
    }
    setLoading(false)
  }

  async function handleSignIn() {
    setAuthError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })

    if (error) {
      setAuthError('Не получилось открыть вход через Google. Попробуй ещё раз.')
    }
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      setAuthError('Не получилось выйти. Попробуй ещё раз.')
      return
    }

    setJoinedGame(null)
    setGameCreated(false)
    setFormError(null)
    setOrganizerName('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)

    if (!user) {
      setFormError('Сначала войди через Google.')
      return
    }

    // Иначе игра создастся, но тут же выпадет из списка как прошедшая.
    if (!isUpcoming({ date, time })) {
      setFormError('Это время уже прошло — выбери будущую дату или время.')
      return
    }

    setSubmitting(true)

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
        owner_id: user.id,
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
    setGameCreated(true)

    setPlace('')
    setDate('')
    setTime('')
    setPrice('')
    setTotal('')
    setFormat(FORMATS[0])
    setLevel(LEVELS[0])
    setOrganizerName(displayName(user))
    setWhatsapp('')
  }

  async function handleJoin(id, name) {
    const trimmedName = name.trim()
    if (!trimmedName) return

    setFormError(null)

    if (!user) {
      setFormError('Сначала войди через Google.')
      return
    }

    // Записываемся через функцию в базе: напрямую менять чужую игру
    // политика games_update_own не разрешает.
    const { data, error } = await supabase.rpc('join_game', {
      p_game_id: id,
      p_name: trimmedName,
    })

    if (error) {
      setFormError(joinErrorMessage(error))
      return
    }

    setGames((prevGames) => prevGames.map((g) => (g.id === id ? data : g)))
    setJoinedGame(data)
  }

  async function handleCancelGame(id) {
    // Удалить пускает только политика games_delete_own, то есть владельца.
    // .select() нужен, чтобы отличить «удалено» от «политика не пустила»:
    // без него чужая игра вернёт успех и пустой результат.
    const { data, error } = await supabase
      .from('games')
      .delete()
      .eq('id', id)
      .select()

    if (error) {
      return {
        ok: false,
        message: 'Не получилось отменить игру. Попробуй ещё раз.',
      }
    }

    if (data.length === 0) {
      return { ok: false, message: 'Отменить игру может только организатор.' }
    }

    setGames((prevGames) => prevGames.filter((g) => g.id !== id))
    return { ok: true }
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Запрос отсекает прошлые дни, а время сегодняшних игр проверяем здесь:
  // так же пересчитается и игра, которая началась при открытой странице.
  const upcomingGames = games.filter((game) => isUpcoming(game))

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

        {!supabaseConfigError && (
          <AuthBar
            user={user}
            ready={authReady}
            onSignIn={handleSignIn}
            onSignOut={handleSignOut}
          />
        )}

        {authError && (
          <p className="status-message status-message--error">{authError}</p>
        )}
      </header>

      {supabaseConfigError ? (
        <p className="status-message status-message--error">
          {supabaseConfigError}
        </p>
      ) : gameCreated ? (
        <div className="confirmation">
          <h2>Игра создана!</h2>
          <p className="confirmation-line">
            Она уже в списке — игроки могут записываться.
          </p>
          <p className="confirmation-note">
            Ты организатор этой игры. Отменить её можешь только ты — кнопка
            «Отменить игру» есть на её карточке, пока ты в аккаунте.
          </p>
          <button
            className="primary-button"
            onClick={() => setGameCreated(false)}
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

          <button className="primary-button" onClick={() => setJoinedGame(null)}>
            Назад к играм
          </button>
        </div>
      ) : (
        <>
          {loading && <p className="status-message">Загружаем игры…</p>}

          {loadError && (
            <p className="status-message status-message--error">{loadError}</p>
          )}

          {!loading && !loadError && (
            <GameList
              games={upcomingGames}
              user={user}
              onJoin={handleJoin}
              onCancel={handleCancelGame}
              onSignIn={handleSignIn}
              onCreateClick={scrollToForm}
            />
          )}

          <h2>Создать игру</h2>

          {formError && (
            <p className="status-message status-message--error">{formError}</p>
          )}

          {!user ? (
            <div className="auth-gate" ref={formRef}>
              <p>Чтобы создать игру, войди — так мы поймём, чья она.</p>
              <GoogleButton onClick={handleSignIn}>
                Войти через Google
              </GoogleButton>
            </div>
          ) : (
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
                  min={todayIso()}
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
          )}
        </>
      )}
    </div>
  )
}

export default App
