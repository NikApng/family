import { setTimeout as delay } from "timers/promises"

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000
const HARD_LOCKOUT_THRESHOLD = 15
const HARD_LOCKOUT_MS = 60 * 60 * 1000

type Bucket = {
  failures: number
  firstFailureAt: number
  lockedUntil: number
  totalFailures: number
}

type Store = Map<string, Bucket>

const GLOBAL_KEY = "__adminLoginRateLimitStore__"

function getStore(): Store {
  const g = globalThis as unknown as Record<string, unknown>
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = new Map<string, Bucket>()
  }
  return g[GLOBAL_KEY] as Store
}

function pruneBucket(bucket: Bucket, now: number) {
  if (bucket.lockedUntil && bucket.lockedUntil <= now) {
    bucket.lockedUntil = 0
  }
  if (bucket.firstFailureAt && now - bucket.firstFailureAt > WINDOW_MS && !bucket.lockedUntil) {
    bucket.failures = 0
    bucket.firstFailureAt = 0
  }
}

function getBucket(key: string, now: number) {
  const store = getStore()
  const existing = store.get(key)
  if (existing) {
    pruneBucket(existing, now)
    return existing
  }
  const fresh: Bucket = { failures: 0, firstFailureAt: 0, lockedUntil: 0, totalFailures: 0 }
  store.set(key, fresh)
  return fresh
}

export type LoginLockStatus =
  | { locked: false }
  | { locked: true; retryAfterMs: number }

function statusFromBucket(bucket: Bucket, now: number): LoginLockStatus {
  if (bucket.lockedUntil && bucket.lockedUntil > now) {
    return { locked: true, retryAfterMs: bucket.lockedUntil - now }
  }
  return { locked: false }
}

function combineStatuses(...statuses: LoginLockStatus[]): LoginLockStatus {
  let worst: LoginLockStatus = { locked: false }
  for (const s of statuses) {
    if (s.locked && (!worst.locked || s.retryAfterMs > worst.retryAfterMs)) {
      worst = s
    }
  }
  return worst
}

function makeKey(prefix: "ip" | "email", value: string | null | undefined) {
  const normalized = String(value ?? "").trim().toLowerCase()
  if (!normalized) return null
  return `${prefix}:${normalized}`
}

export function checkLoginLockout(ip: string | null | undefined, email: string | null | undefined): LoginLockStatus {
  const now = Date.now()
  const statuses: LoginLockStatus[] = []

  const ipKey = makeKey("ip", ip)
  if (ipKey) statuses.push(statusFromBucket(getBucket(ipKey, now), now))

  const emailKey = makeKey("email", email)
  if (emailKey) statuses.push(statusFromBucket(getBucket(emailKey, now), now))

  return combineStatuses(...statuses)
}

export function registerLoginFailure(
  ip: string | null | undefined,
  email: string | null | undefined,
): LoginLockStatus {
  const now = Date.now()
  const statuses: LoginLockStatus[] = []

  for (const key of [makeKey("ip", ip), makeKey("email", email)]) {
    if (!key) continue
    const bucket = getBucket(key, now)

    if (!bucket.firstFailureAt || now - bucket.firstFailureAt > WINDOW_MS) {
      bucket.firstFailureAt = now
      bucket.failures = 0
    }

    bucket.failures += 1
    bucket.totalFailures += 1

    if (bucket.failures >= MAX_ATTEMPTS) {
      const lockDuration = bucket.totalFailures >= HARD_LOCKOUT_THRESHOLD ? HARD_LOCKOUT_MS : LOCKOUT_MS
      bucket.lockedUntil = now + lockDuration
      bucket.failures = 0
      bucket.firstFailureAt = 0
    }

    statuses.push(statusFromBucket(bucket, now))
  }

  return combineStatuses(...statuses)
}

export function resetLoginFailures(ip: string | null | undefined, email: string | null | undefined) {
  const store = getStore()
  for (const key of [makeKey("ip", ip), makeKey("email", email)]) {
    if (!key) continue
    store.delete(key)
  }
}

export async function addFailureDelay(minMs = 400, maxMs = 900) {
  const jitter = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
  await delay(jitter)
}

export function getLoginRateLimitConfig() {
  return {
    windowMs: WINDOW_MS,
    maxAttempts: MAX_ATTEMPTS,
    lockoutMs: LOCKOUT_MS,
    hardLockoutMs: HARD_LOCKOUT_MS,
    hardLockoutThreshold: HARD_LOCKOUT_THRESHOLD,
  }
}
