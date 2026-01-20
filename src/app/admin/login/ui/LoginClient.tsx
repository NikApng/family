"use client"

import { signIn } from "next-auth/react"
import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

type FormState = {
  email: string
  password: string
}

function safeText(v: unknown) {
  return String(v ?? "").trim()
}

export default function LoginClient() {
  const router = useRouter()
  const sp = useSearchParams()

  const callbackUrl = useMemo(() => {
    const raw = sp.get("callbackUrl")
    return safeText(raw) || "/admin"
  }, [sp])

  const [form, setForm] = useState<FormState>({ email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = safeText(form.email).length > 0 && safeText(form.password).length > 0

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || isLoading) return

    setIsLoading(true)
    setError(null)

    const res = await signIn("credentials", {
      redirect: false,
      email: safeText(form.email),
      password: form.password,
      callbackUrl,
    })

    setIsLoading(false)

    if (!res?.ok) {
      setError("Неверный логин или пароль")
      return
    }

    router.replace(res.url ?? callbackUrl)
  }

  return (
    <div className="mx-auto grid w-full max-w-md gap-6">
      <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
        <div className="text-xl font-semibold text-gray-900">Вход в админку</div>
        <div className="mt-1 text-sm text-gray-600">Введите почту и пароль администратора.</div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-5 grid gap-3">
          <input
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="h-11 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300"
            placeholder="Email"
            type="email"
            autoComplete="email"
            required
          />
          <input
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            className="h-11 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300"
            placeholder="Пароль"
            type="password"
            autoComplete="current-password"
            required
          />
          <button
            disabled={!canSubmit || isLoading}
            className="h-11 rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isLoading ? "Входим..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  )
}
