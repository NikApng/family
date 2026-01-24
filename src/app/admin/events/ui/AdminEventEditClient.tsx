"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import UploadPhotoClient from "../../gallery/UploadPhotoClient"

type EventItem = {
  id: string
  title: string
  description: string
  date: string
  place: string | null
  imageUrl: string | null
}

type FormState = {
  title: string
  description: string
  date: string
  place: string
  imageUrl: string
}

function safeText(v: unknown) {
  return String(v ?? "").trim()
}

function isValidImageUrl(value: string) {
  const v = safeText(value)
  if (!v) return false

  if (v.startsWith("/uploads/")) return true
  if (v.startsWith("/images/")) return true
  if (v.startsWith("http://")) return true
  if (v.startsWith("https://")) return true

  return false
}

function safeImageSrc(value: string | null) {
  const v = safeText(value)
  return isValidImageUrl(v) ? v : "/images/image.png"
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

type Props = {
  id: string
}

export default function AdminEventEditClient({ id }: Props) {
  const router = useRouter()
  const [item, setItem] = useState<EventItem | null>(null)
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    date: toDatetimeLocal(new Date()),
    place: "",
    imageUrl: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    const image = safeText(form.imageUrl)
    const imageOk = !image || isValidImageUrl(image)
    return (
      safeText(form.title).length > 0 &&
      safeText(form.description).length > 0 &&
      safeText(form.date).length > 0 &&
      imageOk
    )
  }, [form])

  const load = async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiJson<EventItem>(`/api/events/${id}`)
      setItem(data)
      setForm({
        title: data.title,
        description: data.description,
        date: toDatetimeLocal(new Date(data.date)),
        place: data.place ?? "",
        imageUrl: data.imageUrl ?? "",
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setIsSaving(true)
    setError(null)

    try {
      await apiJson<EventItem>(`/api/events/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: safeText(form.title),
          description: safeText(form.description),
          date: new Date(form.date).toISOString(),
          place: safeText(form.place),
          imageUrl: safeText(form.imageUrl),
        }),
      })

      router.push("/admin/events")
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения")
    } finally {
      setIsSaving(false)
    }
  }

  const onDelete = async () => {
    setError(null)
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.text())
      router.push("/admin/events")
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка удаления")
    }
  }

  if (isLoading) return <div className="text-sm text-gray-600">Загрузка...</div>

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Редактировать событие</h1>
          <div className="mt-1 text-sm text-gray-600">{item?.title ?? ""}</div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/events"
            className="inline-flex h-10 items-center justify-center rounded-md border border-indigo-100 bg-white px-4 text-sm font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50"
          >
            Назад
          </Link>

          <button
            type="button"
            onClick={() => void onDelete()}
            className="inline-flex h-10 items-center justify-center rounded-md border border-rose-100 bg-rose-50 px-4 text-sm font-semibold text-rose-700 hover:border-rose-200"
          >
            Удалить
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
        <UploadPhotoClient targetInputId="imageUrl" />

        {isValidImageUrl(form.imageUrl) ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-indigo-100 bg-white">
            <div className="aspect-[16/9]">
              <img src={safeImageSrc(form.imageUrl)} alt="" className="h-full w-full object-cover" />
            </div>
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

          <input
            id="imageUrl"
            value={form.imageUrl}
            onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
            placeholder="URL картинки (https://… или /uploads/… или /images/…)"
            className="h-11 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300"
          />

          {!isValidImageUrl(form.imageUrl) && safeText(form.imageUrl).length > 0 ? (
            <div className="text-xs font-semibold text-rose-700">
              Нужен корректный URL: https://… или /uploads/… или /images/…
            </div>
          ) : null}

          <button
            disabled={!canSubmit || isSaving}
            className="h-11 rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSaving ? "Сохранение..." : "Сохранить изменения"}
          </button>
        </form>
      </div>
    </div>
  )
}

