export function buildWhatsAppLink(value) {
  const trimmed = value.trim()

  if (/^https?:\/\//i.test(trimmed)) return trimmed

  const digits = trimmed.replace(/\D/g, '')
  return `https://wa.me/${digits}`
}
