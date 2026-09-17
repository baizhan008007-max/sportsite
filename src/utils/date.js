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
