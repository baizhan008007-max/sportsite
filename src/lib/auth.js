import { supabase, supabaseConfigError } from './supabaseClient'
import { normalizePhone, phoneToEmail, PHONE_ERROR } from '../utils/phone'

// Столько же требует сам Supabase по умолчанию. Проверяем и у себя, чтобы
// человек увидел понятный текст, а не ответ сервера на английском.
export const MIN_PASSWORD = 6

// Эти настройки в Supabase нельзя проверить из кода, поэтому если сервер
// отвечает «подтверди почту» — показываем, что именно надо выключить.
const CONFIRM_EMAIL_HINT =
  'Вход почти работает, но в Supabase осталось включено подтверждение почты. ' +
  'Authentication → Sign In / Providers → Email → выключи «Confirm email». ' +
  'Подтвердить наши адреса невозможно: письма на них не приходят.'

const AUTH_ERRORS = {
  invalid_credentials: 'Неверный номер или пароль.',
  user_already_exists: 'Этот номер уже зарегистрирован — попробуй войти.',
  email_exists: 'Этот номер уже зарегистрирован — попробуй войти.',
  weak_password: `Пароль слишком короткий — нужно минимум ${MIN_PASSWORD} символов.`,
  over_request_rate_limit:
    'Слишком много попыток подряд. Подожди минуту и попробуй снова.',
  // Эта ошибка приходит, только если Supabase пытается отправить письмо — то
  // есть если «Confirm email» остался включённым. Писем на наши служебные
  // адреса быть не должно вовсе.
  over_email_send_rate_limit: CONFIRM_EMAIL_HINT,
  email_not_confirmed: CONFIRM_EMAIL_HINT,
  signup_disabled:
    'Регистрация выключена в Supabase: Authentication → Sign In / Providers → ' +
    'Email → включи «Allow new users to sign up».',
  email_provider_disabled:
    'В Supabase выключен вход по email, а вся наша схема на нём держится: ' +
    'Authentication → Sign In / Providers → Email → включи провайдер.',
  // Выяснено вживую 5 окт 2026: дело не в домене. Supabase проверяет адрес на
  // доставляемость только когда собирается отправить письмо — то есть этот код
  // приходит ровно тогда, когда включено подтверждение почты.
  email_address_invalid: CONFIRM_EMAIL_HINT,
}

// Код ошибки у supabase-js лежит в error.code, но у старых ответов его нет —
// тогда ищем название кода внутри текста, как сделано для join_game в App.jsx.
function authErrorMessage(error, fallback) {
  if (error.code && AUTH_ERRORS[error.code]) return AUTH_ERRORS[error.code]

  const key = Object.keys(AUTH_ERRORS).find((code) =>
    error.message?.includes(code)
  )
  return key ? AUTH_ERRORS[key] : fallback
}

// Общая проверка для входа и регистрации. Возвращает либо { phone, email },
// либо { message } — текст ошибки для показа.
function checkCredentials(phoneInput, password) {
  if (supabaseConfigError) return { message: supabaseConfigError }

  const phone = normalizePhone(phoneInput)
  if (!phone) return { message: PHONE_ERROR }

  if (!password || password.length < MIN_PASSWORD) {
    return {
      message: `Пароль слишком короткий — нужно минимум ${MIN_PASSWORD} символов.`,
    }
  }

  return { phone, email: phoneToEmail(phone) }
}

// Почта необязательная: она нужна только на будущее, для восстановления
// пароля, когда к проекту подключат отправку писем. Пока просто лежит.
function checkContactEmail(input) {
  const value = input?.trim().toLowerCase() ?? ''
  if (!value) return { contactEmail: null }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return { message: 'Проверь почту: нужен адрес вида name@example.com.' }
  }

  return { contactEmail: value }
}

export async function signUp({
  phone: phoneInput,
  password,
  firstName,
  lastName,
  contactEmail,
}) {
  const checked = checkCredentials(phoneInput, password)
  if (checked.message) return { ok: false, message: checked.message }

  // Имя и фамилию храним порознь, а не одной строкой: собрать из них «Арман Б.»
  // можно всегда, а разделить обратно — нет (у кого-то двойное имя, у кого-то
  // фамилия из двух слов, и где тут граница, не угадать).
  const first = firstName?.trim() ?? ''
  if (!first) return { ok: false, message: 'Введи своё имя.' }

  const last = lastName?.trim() ?? ''
  if (!last) return { ok: false, message: 'Введи фамилию.' }

  const mail = checkContactEmail(contactEmail)
  if (mail.message) return { ok: false, message: mail.message }

  const { data, error } = await supabase.auth.signUp({
    email: checked.email,
    password,
    // Ключи email и phone занимает сам Supabase — он дописывает в метаданные
    // служебный адрес аккаунта. Поэтому свои называем иначе, чтобы наше имя
    // и настоящую почту ничем не перетёрло.
    options: {
      data: {
        first_name: first,
        last_name: last,
        login_phone: checked.phone,
        contact_email: mail.contactEmail,
      },
    },
  })

  if (error) {
    return {
      ok: false,
      message: authErrorMessage(
        error,
        'Не получилось зарегистрироваться. Попробуй ещё раз.'
      ),
    }
  }

  // Когда подтверждение почты включено, Supabase на занятый адрес отвечает не
  // ошибкой, а пустышкой без identities — чтобы по ответу нельзя было
  // проверять, кто уже зарегистрирован.
  if (data.user && data.user.identities?.length === 0) {
    return { ok: false, message: AUTH_ERRORS.user_already_exists }
  }

  // Регистрация без сессии означает то же самое: Supabase ждёт подтверждения
  // письмом, которое на наш адрес не придёт никогда.
  if (!data.session) {
    return { ok: false, message: CONFIRM_EMAIL_HINT }
  }

  return { ok: true, user: data.user }
}

export async function signIn({ phone: phoneInput, password }) {
  const checked = checkCredentials(phoneInput, password)
  if (checked.message) return { ok: false, message: checked.message }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: checked.email,
    password,
  })

  if (error) {
    return {
      ok: false,
      message: authErrorMessage(error, 'Не получилось войти. Попробуй ещё раз.'),
    }
  }

  return { ok: true, user: data.user }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) return { ok: false, message: 'Не получилось выйти. Попробуй ещё раз.' }

  return { ok: true }
}
