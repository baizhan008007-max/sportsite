// Домен фиктивных адресов. Supabase умеет вход только по email, а SMS-провайдера
// у нас нет, поэтому логином служит номер, превращённый в адрес вида
// 77011234567@phone.sygraem.kz. Письма сюда никто не отправляет — адрес нужен
// только как ключ аккаунта.
//
// МЕНЯТЬ НЕЛЬЗЯ: у всех, кто уже зарегистрировался, логин собран из этого
// домена. Другой домен — другой адрес — другой аккаунт, и старые войти не смогут.
const PHONE_EMAIL_DOMAIN = 'phone.sygraem.kz'

export const PHONE_ERROR = 'Проверь номер: нужен казахстанский, например +7 701 123 45 67.'

// Приводим номер к одному виду '+7XXXXXXXXXX'. Это главное требование ко всей
// схеме входа: один и тот же человек набирает номер то как +7 701, то как
// 8 701, то вообще без кода — а логин из них должен получаться один, иначе
// человек создаст второй аккаунт вместо входа в свой.
// Возвращает null, если на номер не похоже.
export function normalizePhone(input) {
  const digits = String(input ?? '').replace(/\D/g, '')

  // 8 701 ... — привычная местная запись того же номера, что и +7 701 ...
  if (digits.length === 11 && digits.startsWith('8')) {
    return `+7${digits.slice(1)}`
  }

  if (digits.length === 11 && digits.startsWith('7')) {
    return `+${digits}`
  }

  // 701 123 45 67 — номер без кода страны.
  if (digits.length === 10) {
    return `+7${digits}`
  }

  return null
}

// Логин для Supabase. На входе ждёт уже нормализованный номер, иначе из
// '+7 701' и '8701' получились бы разные адреса — ровно то, от чего
// normalizePhone и защищает.
export function phoneToEmail(normalizedPhone) {
  const digits = normalizedPhone.replace(/\D/g, '')
  return `${digits}@${PHONE_EMAIL_DOMAIN}`
}

// Для показа на экране: '+77011234567' → '+7 701 123 45 67'.
export function formatPhone(normalizedPhone) {
  const digits = normalizedPhone.replace(/\D/g, '')
  const parts = digits.match(/^7(\d{3})(\d{3})(\d{2})(\d{2})$/)
  if (!parts) return normalizedPhone

  const [, code, a, b, c] = parts
  return `+7 ${code} ${a} ${b} ${c}`
}
