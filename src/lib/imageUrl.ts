export function normalizeImageUrl(value: unknown) {
  const raw = String(value ?? "").trim()
  if (!raw) return ""

  const v = raw.replaceAll("\\", "/")

  if (v.startsWith("public/uploads/")) return `/${v.slice("public/".length)}`
  if (v.startsWith("public/images/")) return `/${v.slice("public/".length)}`
  if (v.startsWith("uploads/")) return `/${v}`
  if (v.startsWith("images/")) return `/${v}`

  return v
}

export function isValidImageUrl(value: unknown) {
  const v = normalizeImageUrl(value)
  if (!v) return false

  return v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/uploads/") || v.startsWith("/images/")
}

export function safeImageSrc(value: unknown, fallback: string) {
  const v = normalizeImageUrl(value)
  return isValidImageUrl(v) ? v : fallback
}
