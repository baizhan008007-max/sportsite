const WEEKDAYS = [
  'Воскресенье',
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
]

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function humanizeDate(isoDate) {
  const today = startOfDay(new Date())
  const target = startOfDay(new Date(isoDate))
  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Сегодня'
  if (diffDays === 1) return 'Завтра'
  return WEEKDAYS[target.getDay()]
}

// 'YYYY-MM-DD' по местным часам игрока — в таком виде даты лежат в колонке
// games.date, поэтому строку можно отдавать прямо в фильтр запроса.
export function todayIso(now = new Date()) {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Собираем момент начала игры по местным часам: date — '2026-10-02',
// time — '19:00' или '19:00:00'.
function gameStart({ date, time }) {
  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)
  return new Date(year, month - 1, day, hours, minutes)
}

// Игра ещё впереди, если её время не наступило по тем же часам, по которым
// на карточке написано «Сегодня, 19:00» — то есть по часам игрока.
export function isUpcoming(game, now = new Date()) {
  return gameStart(game) >= now
}
