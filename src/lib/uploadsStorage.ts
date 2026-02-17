import path from "path"

const DEFAULT_UPLOADS_DIR = path.join(process.cwd(), "public", "uploads")

export function getUploadsDir() {
  const configured = String(process.env.UPLOADS_DIR ?? "").trim()
  return path.resolve(configured || DEFAULT_UPLOADS_DIR)
}

export function getPublicUploadsDir() {
  return path.resolve(path.join(process.cwd(), "public", "uploads"))
}

export function getUploadPublicUrl(filename: string) {
  return `/uploads/${filename}`
}

export function sanitizeUploadFilename(value: unknown) {
  const v = String(value ?? "").trim()
  if (!v) return ""

  const base = path.basename(v)
  if (!/^[A-Za-z0-9._-]+$/.test(base)) return ""

  return base
}
