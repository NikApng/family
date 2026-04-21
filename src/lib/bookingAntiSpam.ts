import { createHmac, timingSafeEqual } from "crypto"

const TOKEN_MAX_AGE_MS = 2 * 60 * 60 * 1000
const TOKEN_MIN_AGE_MS = 2500
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 3

const marketingPatterns = [
  /контекстн/i,
  /реклам/i,
  /seo/i,
  /продвиж/i,
  /каталог/i,
  /зарегистрир/i,
  /потенциальн.{0,16}клиент/i,
  /баз[ауые]\s+клиент/i,
  /excel/i,
  /парс/i,
  /лид[ыао]?/i,
  /whatsapp/i,
  /telegram/i,
]

export type BookingSpamReason =
  | "honeypot"
  | "invalid_token"
  | "too_fast"
  | "expired_token"
  | "obvious_spam"
  | "rate_limited"
  | "duplicate"

type TokenCheckResult =
  | { ok: true; ageMs: number }
  | { ok: false; reason: Extract<BookingSpamReason, "invalid_token" | "too_fast" | "expired_token"> }

function getSecret() {
  return process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "local-booking-form-secret"
}

function signTimestamp(timestamp: number) {
  return createHmac("sha256", getSecret()).update(String(timestamp)).digest("hex")
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}

export function createBookingFormToken(timestamp = Date.now()) {
  return `${timestamp}.${signTimestamp(timestamp)}`
}

export function verifyBookingFormToken(token: string | null | undefined, now = Date.now()): TokenCheckResult {
  const [timestampRaw, signature] = String(token ?? "").split(".")
  const timestamp = Number(timestampRaw)

  if (!timestampRaw || !signature || !Number.isFinite(timestamp)) {
    return { ok: false, reason: "invalid_token" }
  }

  if (!safeEqual(signature, signTimestamp(timestamp))) {
    return { ok: false, reason: "invalid_token" }
  }

  const ageMs = now - timestamp
  if (ageMs < TOKEN_MIN_AGE_MS) return { ok: false, reason: "too_fast" }
  if (ageMs > TOKEN_MAX_AGE_MS || ageMs < 0) return { ok: false, reason: "expired_token" }

  return { ok: true, ageMs }
}

export function getClientIp(headersList: Pick<Headers, "get">) {
  const forwarded = headersList.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() || null

  return (
    headersList.get("x-real-ip")?.trim() ||
    headersList.get("cf-connecting-ip")?.trim() ||
    headersList.get("x-client-ip")?.trim() ||
    null
  )
}

export function getRateLimitWindowStart(now = Date.now()) {
  return new Date(now - RATE_LIMIT_WINDOW_MS)
}

export function getDuplicateWindowStart(now = Date.now()) {
  return new Date(now - DUPLICATE_WINDOW_MS)
}

export function getMaxBookingRequestsPerWindow() {
  return MAX_REQUESTS_PER_WINDOW
}

function countMatches(value: string, patterns: RegExp[]) {
  return patterns.reduce((score, pattern) => score + (pattern.test(value) ? 1 : 0), 0)
}

function countUrls(value: string) {
  return (value.match(/https?:\/\/|www\.|[a-z0-9-]+\.[a-z]{2,}/gi) ?? []).length
}

export function getObviousBookingSpamReason(input: {
  name: string
  email: string
  message: string
  honeypot: string
  formToken: string
}): BookingSpamReason | null {
  if (input.honeypot.trim()) return "honeypot"

  const tokenCheck = verifyBookingFormToken(input.formToken)
  if (!tokenCheck.ok) return tokenCheck.reason

  const name = input.name.trim()
  const email = input.email.trim()
  const message = input.message.trim()
  const combined = `${name}\n${email}\n${message}`
  const normalized = combined.replace(/\s+/g, " ")

  if (/^\d+$/.test(name)) return "obvious_spam"
  if (countUrls(combined) >= 2) return "obvious_spam"

  const marketingScore = countMatches(normalized, marketingPatterns)
  if (marketingScore >= 2) return "obvious_spam"
  if (marketingScore >= 1 && /mail\.ru|gmail\.com|yandex\./i.test(email) && /[a-z]{5,}/i.test(name)) {
    return "obvious_spam"
  }

  return null
}
