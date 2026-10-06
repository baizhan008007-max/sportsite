import { formatPhone } from './phone'

// Имя и фамилию человек вводит при регистрации, в user_metadata они лежат
// порознь. Здесь собираем то, что видят остальные: «Арман Б.». Фамилия целиком
// на сайте не нужна, а одной буквы хватает, чтобы в списке участников не
// оказалось трёх неразличимых Арманов.
//
// Нарочно не подставляем user.email, хотя раньше так и было: теперь там
// служебный адрес вида 77011234567@phone.sygraem.kz. Он попал бы не только в
// шапку сайта, но и в поле «Твоё имя» при создании игры, и в список участников
// — то есть этот адрес увидели бы все.
export function displayName(user) {
  if (!user) return ''

  const meta = user.user_metadata ?? {}
  const first = meta.first_name?.trim()
  const last = meta.last_name?.trim()

  if (first && last) return `${first} ${last.slice(0, 1).toUpperCase()}.`
  if (first) return first

  // meta.name — аккаунты, зарегистрированные до разделения на имя и фамилию.
  if (meta.name) return meta.name
  if (meta.login_phone) return formatPhone(meta.login_phone)
  return 'Игрок'
}

// Номер, по которому вошли. Показываем в шапке: почты у аккаунта нет, и это
// единственный способ понять, в чей аккаунт ты попал — например, если с одного
// телефона заходят двое.
export function loginPhone(user) {
  const phone = user?.user_metadata?.login_phone
  return phone ? formatPhone(phone) : null
}
