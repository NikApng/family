import { cookies } from "next/headers"
import { decode } from "next-auth/jwt"
import { NextResponse } from "next/server"

export async function requireAdmin(): Promise<NextResponse | null> {
  const store = await cookies()

  // NextAuth uses __Secure- prefix when NEXTAUTH_URL is https
  const secure = process.env.NEXTAUTH_URL?.startsWith("https://")
  const cookieName = secure
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token"

  const raw = store.get(cookieName)?.value

  if (!raw) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })
  }

  try {
    const decoded = await decode({ token: raw, secret: process.env.NEXTAUTH_SECRET ?? "" })
    if (!decoded) throw new Error()
    return null
  } catch {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })
  }
}
