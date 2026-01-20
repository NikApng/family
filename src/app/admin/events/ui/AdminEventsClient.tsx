"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

type EventItem = {
  id: string
  title: string
  description: string
  date: string
  place: string | null
  createdAt: string
  updatedAt: string
}

type FormState = {
  title: string
  description: string
  date: string
  place: string
}

function safeText(v: unknown) {
  return String(v ?? "").trim()
}

async function apiJson<T>(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }

  return (await res.json()) as T
}

function toDatetimeLocal(value: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  const y = value.getFullYear()
  const m = pad(value.getMonth() + 1)
  const d = pad(value.getDate())
  const hh = pad(value.getHours())
  const mm = pad(value.getMinutes())
  return `${y}-${m}-${d}T${hh}:${mm}`
}

export default function AdminEventsClient() {
  const [items, setItems] = useState<EventItem[]>([])
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    date: toDatetimeLocal(new Date()),
    place: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return safeText(form.title).length > 0 && safeText(form.description).length > 0 && safeText(form.date).length > 0
  }, [form])

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiJson<EventItem[]>("/api/events")
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setIsSaving(true)
    setError(null)

    try {
      await apiJson<EventItem>("/api/events", {
        method: "POST",
        body: JSON.stringify({
          title: safeText(form.title),
          description: safeText(form.description),
          date: new Date(form.date).toISOString(),
          place: safeText(form.place),
        }),
      })

      setForm((p) => ({ ...p, title: "", description: "" }))
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения")
    } finally {
      setIsSaving(false)
    }
  }

  const onDelete = async (id: string) => {
    setError(null)
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.text())
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка удаления")
    }
  }

  return (
    <div className="grid gap-8">
      <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
        <div className="text-lg font-semibold text-gray-900">Добавить событие</div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:max-w-3xl">
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Название"
            className="h-11 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300"
            required
          />

          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Описание"
            className="min-h-28 rounded-md border border-indigo-100 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-300"
            required
          />

          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              className="h-11 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300"
              required
            />
            <input
              value={form.place}
              onChange={(e) => setForm((p) => ({ ...p, place: e.target.value }))}
              placeholder="Место (необязательно)"
              className="h-11 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300"
            />
          </div>

          <button
            disabled={!canSubmit || isSaving}
            className="h-11 rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
        <div className="text-lg font-semibold text-gray-900">Список</div>
        <div className="mt-1 text-sm text-gray-600">Редактирование и удаление событий.</div>

        {isLoading ? <div className="mt-4 text-sm text-gray-600">Загрузка...</div> : null}

        <div className="mt-4 grid gap-3">
          {items.map((e) => (
            <div key={e.id} className="rounded-2xl border border-indigo-100 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{e.title}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(e.date))}
                    {e.place ? ` • ${e.place}` : ""}
                  </div>
                  <div className="mt-2 text-sm text-gray-700 line-clamp-3">{e.description}</div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/admin/events/${e.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-indigo-100 bg-white px-3 text-xs font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50"
                  >
                    Редактировать
                  </Link>

                  <button
                    type="button"
                    onClick={() => void onDelete(e.id)}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-rose-100 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:border-rose-200"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!isLoading && !items.length ? <div className="text-sm text-gray-600">Пока пусто.</div> : null}
        </div>
      </div>
    </div>
  )
}
