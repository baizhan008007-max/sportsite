import { avatarUrl, displayName } from '../utils/user'

export function GoogleIcon() {
  return (
    <svg className="google-icon" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  )
}

export function GoogleButton({ onClick, disabled, children }) {
  return (
    <button className="google-button" onClick={onClick} disabled={disabled}>
      <GoogleIcon />
      {children}
    </button>
  )
}

function AuthBar({ user, ready, onSignIn, onSignOut }) {
  if (!ready) {
    return <div className="auth-bar auth-bar--loading">Проверяем вход…</div>
  }

  if (!user) {
    return (
      <div className="auth-bar">
        <GoogleButton onClick={onSignIn}>Войти через Google</GoogleButton>
      </div>
    )
  }

  const avatar = avatarUrl(user)

  return (
    <div className="auth-bar">
      <div className="auth-user">
        {avatar ? (
          <img className="auth-avatar" src={avatar} alt="" />
        ) : (
          <span className="auth-avatar auth-avatar--empty" aria-hidden="true">
            {displayName(user).slice(0, 1)}
          </span>
        )}
        <span className="auth-name">{displayName(user)}</span>
      </div>
      <button className="auth-signout" onClick={onSignOut}>
        Выйти
      </button>
    </div>
  )
}

export default AuthBar
