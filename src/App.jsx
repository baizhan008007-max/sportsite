import { useRef, useState } from 'react'
import GameList from './components/GameList'
import { addDays, humanizeDate, nextWeekday, toISODate } from './utils/date'
import { buildWhatsAppLink } from './utils/whatsapp'
import './App.css'

const today = new Date()
const tomorrow = addDays(today, 1)
const saturday = nextWeekday(today, 6)
const sunday = nextWeekday(today, 0)

const FORMATS = ['5x5', '6x6', '7x7', '8x8']
const LEVELS = ['Любой', 'Начинающий', 'Средний', 'Опытный']

const initialGames = [
  {
    id: 1,
    place: 'Центральный стадион',
    date: toISODate(today),
    time: '19:00',
    price: 2000,
    total: 10,
    format: '5x5',
    level: 'Средний',
    organizerName: 'Данияр',
    whatsapp: 'https://chat.whatsapp.com/K1a2B3c4D5e6F7g8H9i0J1',
    participants: [
      'Ерлан',
      'Азамат',
      'Тимур',
      'Санжар',
      'Бекзат',
      'Алишер',
      'Максат',
      'Дамир',
    ],
  },
  {
    id: 2,
    place: 'Стадион «Динамо»',
    date: toISODate(today),
    time: '20:30',
    price: 1500,
    total: 12,
    format: '6x6',
    level: 'Любой',
    organizerName: 'Арман',
    whatsapp: '+7 707 123 45 67',
    participants: ['Бауыржан', 'Жандос', 'Ануар', 'Ильяс'],
  },
  {
    id: 3,
    place: 'Футбольный манеж «Алатау»',
    date: toISODate(tomorrow),
    time: '18:00',
    price: 2500,
    total: 10,
    format: '5x5',
    level: 'Опытный',
    organizerName: 'Алмас',
    whatsapp: 'https://chat.whatsapp.com/M2n3O4p5Q6r7S8t9U0v1W2',
    participants: [
      'Асхат',
      'Мадияр',
      'Нурлан',
      'Айдос',
      'Рустем',
      'Ерлан',
      'Санжар',
      'Дамир',
      'Тимур',
    ],
  },
  {
    id: 4,
    place: 'Парк Первого Президента',
    date: toISODate(tomorrow),
    time: '20:00',
    price: 1800,
    total: 10,
    format: '7x7',
    level: 'Средний',
    organizerName: 'Бекзат',
    whatsapp: '+7 701 987 65 43',
    participants: [
      'Азамат',
      'Максат',
      'Ильяс',
      'Жандос',
      'Ануар',
      'Данияр',
      'Арман',
      'Алишер',
      'Асхат',
      'Мадияр',
    ],
  },
  {
    id: 5,
    place: 'СК «Спартак»',
    date: toISODate(saturday),
    time: '17:00',
    price: 2200,
    total: 14,
    format: '7x7',
    level: 'Начинающий',
    organizerName: 'Нурлан',
    whatsapp: 'https://chat.whatsapp.com/X3y4Z5a6B7c8D9e0F1g2H3',
    participants: [],
  },
  {
    id: 6,
    place: 'Freedom Sport Arena',
    date: toISODate(saturday),
    time: '19:30',
    price: 2000,
    total: 12,
    format: '6x6',
    level: 'Любой',
    organizerName: 'Айдос',
    whatsapp: '+7 705 222 11 00',
    participants: ['Рустем', 'Тимур', 'Дамир', 'Санжар', 'Бекзат', 'Ерлан'],
  },
  {
    id: 7,
    place: 'Спорткомплекс «Есентай Парк»',
    date: toISODate(sunday),
    time: '16:00',
    price: 1600,
    total: 16,
    format: '8x8',
    level: 'Начинающий',
    organizerName: 'Рустем',
    whatsapp: 'https://chat.whatsapp.com/Y4z5A6b7C8d9E0f1G2h3I4',
    participants: ['Алмас', 'Асхат', 'Мадияр'],
  },
  {
    id: 8,
    place: 'Arena City',
    date: toISODate(sunday),
    time: '18:30',
    price: 1800,
    total: 10,
    format: '5x5',
    level: 'Опытный',
    organizerName: 'Санжар',
    whatsapp: '+7 747 555 44 33',
    participants: [
      'Данияр',
      'Арман',
      'Алишер',
      'Максат',
      'Жандос',
      'Ануар',
      'Ильяс',
    ],
  },
]

function App() {
  const [games, setGames] = useState(initialGames)
  const [joinedGame, setJoinedGame] = useState(null)
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

  function handleSubmit(e) {
    e.preventDefault()

    const newGame = {
      id: Date.now(),
      place,
      date,
      time,
      price: Number(price),
      total: Number(total),
      format,
      level,
      organizerName,
      whatsapp,
      participants: [],
    }

    setGames((prevGames) => [...prevGames, newGame])

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

  function handleJoin(id, name) {
    const trimmedName = name.trim()
    if (!trimmedName) return

    const game = games.find((g) => g.id === id)
    if (!game || game.participants.length >= game.total) return

    const updatedGame = {
      ...game,
      participants: [...game.participants, trimmedName],
    }

    setGames((prevGames) =>
      prevGames.map((g) => (g.id === id ? updatedGame : g))
    )
    setJoinedGame(updatedGame)
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

      {joinedGame ? (
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
            Организатор: {joinedGame.organizerName}
          </p>

          <a
            className="whatsapp-button"
            href={buildWhatsAppLink(joinedGame.whatsapp)}
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
          <GameList
            games={games}
            onJoin={handleJoin}
            onCreateClick={scrollToForm}
          />

          <h2>Создать игру</h2>
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

            <button type="submit">Добавить игру</button>
          </form>
        </>
      )}
    </div>
  )
}

export default App
