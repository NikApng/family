"use client"

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

export default function AdminLoginPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    })

    setIsLoading(false)

    if (!res || res.error) {
      setError("Неверный email или пароль")
      return
    }

    window.location.href = res.url ?? "/admin"
  }

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto w-full max-w-md px-4 py-16">
        <div className="rounded-3xl border border-indigo-100 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">Вход в админку</h1>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <div className="text-sm font-semibold text-gray-900">Email</div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-md border border-indigo-100 px-3 text-sm outline-none focus:border-indigo-300"
                autoComplete="email"
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-semibold text-gray-900">Пароль</div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="h-11 rounded-md border border-indigo-100 px-3 text-sm outline-none focus:border-indigo-300"
                autoComplete="current-password"
                required
              />
            </div>

            {error ? <div className="text-sm text-rose-700">{error}</div> : null}

            <button
              disabled={isLoading}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isLoading ? "Входим..." : "Войти"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
