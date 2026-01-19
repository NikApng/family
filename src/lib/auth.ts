import type { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcrypt"

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { type: "text" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim()
        const password = credentials?.password ?? ""

        if (!email || !password) return null

        const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim()
        const adminPassword = process.env.ADMIN_PASSWORD ?? ""

        if (!adminEmail || !adminPassword) return null
        if (email !== adminEmail) return null

        const isHashed = adminPassword.startsWith("$2")
        const ok = isHashed
          ? await bcrypt.compare(password, adminPassword)
          : password === adminPassword

        if (!ok) return null

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
