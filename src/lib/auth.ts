import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import {
  addFailureDelay,
  checkLoginLockout,
  registerLoginFailure,
  resetLoginFailures,
} from "@/lib/security/loginRateLimit"

function extractIp(req: unknown): string | null {
  if (!req || typeof req !== "object") return null
  const anyReq = req as { headers?: Record<string, string | string[] | undefined> }
  const headers = anyReq.headers ?? {}

  const pick = (name: string) => {
    const raw = headers[name]
    if (Array.isArray(raw)) return raw[0] ?? null
    return typeof raw === "string" ? raw : null
  }

  const forwarded = pick("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() || null

  return (
    pick("x-real-ip")?.trim() ||
    pick("cf-connecting-ip")?.trim() ||
    pick("x-client-ip")?.trim() ||
    null
  )
}

function formatRetry(ms: number) {
  const totalSeconds = Math.max(1, Math.ceil(ms / 1000))
  const minutes = Math.ceil(totalSeconds / 60)
  if (minutes >= 2) return `${minutes} мин.`
  return `${totalSeconds} сек.`
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { type: "text" },
        password: { type: "password" },
      },
      async authorize(credentials, req) {
        const email = credentials?.email?.trim() ?? ""
        const password = credentials?.password ?? ""
        const ip = extractIp(req)

        const preLock = checkLoginLockout(ip, email)
        if (preLock.locked) {
          throw new Error(
            `Слишком много попыток входа. Повторите через ${formatRetry(preLock.retryAfterMs)}`,
          )
        }

        if (!email || !password) {
          await addFailureDelay()
          return null
        }

        const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim()
        const adminPassword = process.env.ADMIN_PASSWORD ?? ""

        if (!adminEmail || !adminPassword) {
          await addFailureDelay()
          return null
        }

        const emailMatches = email === adminEmail
        const isHashed = adminPassword.startsWith("$2")
        const passwordMatches = emailMatches
          ? isHashed
            ? await bcrypt.compare(password, adminPassword)
            : password === adminPassword
          : false

        if (!emailMatches || !passwordMatches) {
          const after = registerLoginFailure(ip, email)
          await addFailureDelay()
          if (after.locked) {
            throw new Error(
              `Слишком много попыток входа. Повторите через ${formatRetry(after.retryAfterMs)}`,
            )
          }
          return null
        }

        resetLoginFailures(ip, email)
        return { id: "admin", email, role: "admin" }
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role ?? "admin"
      return token
    },
    async session({ session, token }) {
      ;(session as any).role = token.role
      return session
    },
  },
}
