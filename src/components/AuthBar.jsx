import { displayName, loginPhone } from '../utils/user'

// Полоска в шапке: кто вошёл и кнопка «Выйти». Если не вошёл — кнопка, которая
// показывает форму входа (сама форма живёт ниже на странице).
function AuthBar({ user, ready, onShowAuth, onSignOut }) {
  if (!ready) {
    return <div className="auth-bar auth-bar--loading">Проверяем вход…</div>
  }

  if (!user) {
    return (
      <div className="auth-bar">
        <button className="auth-signin" onClick={onShowAuth}>
          Войти
          {/* Стрелка подсказывает, что кнопка не входит сама, а уводит к форме
              ниже. aria-hidden — чтобы читалка не произносила «стрелка вниз». */}
          <span className="auth-signin-arrow" aria-hidden="true">
            ↓
          </span>
        </button>
      </div>
    )
  }

  const name = displayName(user)
  const phone = loginPhone(user)

  return (
    <div className="auth-bar">
      <div className="auth-user">
        <span className="auth-avatar auth-avatar--empty" aria-hidden="true">
          {name.slice(0, 1)}
        </span>
        <span className="auth-identity">
          <span className="auth-name">{name}</span>
          {/* Если имени нет, displayName сам вернёт номер — второй раз не пишем. */}
          {phone && phone !== name && <span className="auth-phone">{phone}</span>}
        </span>
      </div>
      <button className="auth-signout" onClick={onSignOut}>
        Выйти
      </button>
    </div>
  )
}

export default AuthBar
