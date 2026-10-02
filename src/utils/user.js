export function displayName(user) {
  if (!user) return ''

  const meta = user.user_metadata ?? {}
  return meta.full_name || meta.name || user.email || 'Игрок'
}

export function avatarUrl(user) {
  return user?.user_metadata?.avatar_url ?? null
}
