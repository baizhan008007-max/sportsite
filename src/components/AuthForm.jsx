import { useState } from 'react'
import { MIN_PASSWORD } from '../lib/auth'

// Форма входа и регистрации. Про Supabase она ничего не знает: собирает поля и
// отдаёт их наружу, а обратно получает { ok, message } — так же устроена отмена
// игры в GameCard.
function AuthForm({ onSignIn, onSignUp, note }) {
  const [mode, setMode] = useState('signin')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const isSignUp = mode === 'signup'

  function switchMode() {
    setMode(isSignUp ? 'signin' : 'signup')
    // Ошибка от прошлого режима к новому не относится.
    setError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const result = isSignUp
      ? await onSignUp({ phone, password, firstName, lastName, contactEmail })
      : await onSignIn({ phone, password })

    setSubmitting(false)

    // Поля нарочно не чистим: при ошибке человек поправит опечатку, а при
    // успехе форма пропадает с экрана вместе со своим состоянием.
    if (!result.ok) setError(result.message)
  }

  return (
    <div className="auth-form-wrap">
      <h2 className="auth-form-title">{isSignUp ? 'Регистрация' : 'Вход'}</h2>

      {note && <p className="auth-form-note">{note}</p>}

      {error && <p className="status-message status-message--error">{error}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        {isSignUp && (
          <>
            <label>
              Имя
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                placeholder="Арман"
                required
              />
            </label>

            <label>
              Фамилия
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                placeholder="Байжанов"
                required
              />
              <span className="auth-field-hint">
                В списке участников другие увидят «Арман Б.» — целиком фамилию не
                показываем, но тёзок будет не перепутать.
              </span>
            </label>
          </>
        )}

        <label>
          Номер телефона
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            placeholder="+7 701 123 45 67"
            required
          />
        </label>

        <label>
          Пароль
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            required
          />
          {isSignUp && (
            <span className="auth-field-hint">
              Минимум {MIN_PASSWORD} символов. Восстановить пароль пока нельзя —
              запиши его где-нибудь.
            </span>
          )}
        </label>

        <label className="auth-show-password">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => setShowPassword(e.target.checked)}
          />
          Показать пароль
        </label>

        {isSignUp && (
          <label>
            Почта — необязательно
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              autoComplete="email"
              placeholder="azamat@example.com"
            />
            <span className="auth-field-hint">
              Пригодится, когда на сайте появится восстановление пароля. Входить
              всё равно будешь по номеру.
            </span>
          </label>
        )}

        <button type="submit" disabled={submitting}>
          {submitting
            ? isSignUp
              ? 'Создаём…'
              : 'Входим…'
            : isSignUp
              ? 'Зарегистрироваться'
              : 'Войти'}
        </button>
      </form>

      <button type="button" className="auth-switch" onClick={switchMode}>
        {isSignUp
          ? 'Уже есть аккаунт? Войти'
          : 'Нет аккаунта? Зарегистрироваться'}
      </button>
    </div>
  )
}

export default AuthForm
