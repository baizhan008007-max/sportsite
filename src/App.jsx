import { useRef, useState } from 'react'
import GameList from './components/GameList'
import { addDays, humanizeDate, nextWeekday, toISODate } from './utils/date'
import './App.css'

const today = new Date()
const tomorrow = addDays(today, 1)
const saturday = nextWeekday(today, 6)
const sunday = nextWeekday(today, 0)

const initialGames = [
  {
    id: 1,
    sport: 'Футбол',
    place: 'Центральный стадион',
    date: toISODate(today),
    time: '19:00',
    price: 2000,
    filled: 8,
    total: 10,
  },
  {
    id: 2,
    sport: 'Баскетбол',
    place: 'Дворец спорта им. Балуана Шолака',
    date: toISODate(today),
    time: '20:30',
    price: 1500,
    filled: 4,
    total: 10,
  },
  {
    id: 3,
    sport: 'Волейбол',
    place: 'СК «Достык»',
    date: toISODate(tomorrow),
    time: '18:00',
    price: 1000,
    filled: 9,
    total: 10,
  },
  {
    id: 4,
    sport: 'Футбол',
    place: 'Парк Первого Президента',
    date: toISODate(tomorrow),
    time: '20:00',
    price: 1800,
    filled: 10,
    total: 10,
  },
  {
    id: 5,
    sport: 'Баскетбол',
    place: 'Almaty Arena',
    date: toISODate(saturday),
    time: '17:00',
    price: 2500,
    filled: 0,
    total: 10,
  },
  {
    id: 6,
    sport: 'Футбол',
    place: 'СК «Спартак»',
    date: toISODate(saturday),
    time: '19:30',
    price: 2200,
    filled: 6,
    total: 12,
  },
  {
    id: 7,
    sport: 'Волейбол',
    place: 'Парк Горького, площадка №2',
    date: toISODate(sunday),
    time: '16:00',
    price: 800,
    filled: 3,
    total: 8,
  },
  {
    id: 8,
    sport: 'Баскетбол',
    place: 'СК «Sункар»',
    date: toISODate(sunday),
    time: '18:30',
    price: 1600,
    filled: 7,
    total: 10,
  },
]

const SPORTS = ['Все', 'Футбол', 'Баскетбол', 'Волейбол']

function App() {
  const [games, setGames] = useState(initialGames)
  const [filter, setFilter] = useState('Все')
  const [joinedGame, setJoinedGame] = useState(null)
  const formRef = useRef(null)

  const [sport, setSport] = useState('')
  const [place, setPlace] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [price, setPrice] = useState('')
  const [total, setTotal] = useState('')

  function handleSubmit(e) {
    e.preventDefault()

    const newGame = {
      id: Date.now(),
      sport,
      place,
      date,
      time,
      price: Number(price),
      filled: 0,
      total: Number(total),
    }

    setGames((prevGames) => [...prevGames, newGame])

    setSport('')
    setPlace('')
    setDate('')
    setTime('')
    setPrice('')
    setTotal('')
  }

  function handleJoin(id) {
    const game = games.find((g) => g.id === id)
    if (!game || game.filled >= game.total) return

    setGames((prevGames) =>
      prevGames.map((g) => (g.id === id ? { ...g, filled: g.filled + 1 } : g))
    )
    setJoinedGame(game)
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const filteredGames =
    filter === 'Все' ? games : games.filter((game) => game.sport === filter)

  return (
    <div className="page">
      <header className="site-header">
        <h1>Сыграем</h1>
        <p className="site-tagline">
          Поиск любительских игр в Алматы — футбол, баскетбол, волейбол
        </p>
      </header>

      {joinedGame ? (
        <div className="confirmation">
          <h2>Готово, ты записан!</h2>
          <p className="confirmation-line">{joinedGame.sport}</p>
          <p className="confirmation-line">{joinedGame.place}</p>
          <p className="confirmation-line">
            {humanizeDate(joinedGame.date)}, {joinedGame.time}
          </p>
          <p className="confirmation-line">{joinedGame.price} ₸ / чел.</p>
          <button
            className="primary-button"
            onClick={() => setJoinedGame(null)}
          >
            Назад к играм
          </button>
        </div>
      ) : (
        <>
          <div className="sport-filter">
            {SPORTS.map((option) => (
              <button
                key={option}
                type="button"
                className={`filter-button${
                  filter === option ? ' filter-button--active' : ''
                }`}
                onClick={() => setFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <GameList
            games={filteredGames}
            onJoin={handleJoin}
            onCreateClick={scrollToForm}
          />

          <h2>Создать игру</h2>
          <form className="game-form" ref={formRef} onSubmit={handleSubmit}>
            <label>
              Вид спорта
              <input
                type="text"
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                required
              />
            </label>

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

            <button type="submit">Добавить игру</button>
          </form>
        </>
      )}
    </div>
  )
}

export default App
