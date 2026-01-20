"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import UploadPhotoClient from "../UploadPhotoClient"

type PhotoReport = {
  id: string
  title: string
  imageUrl: string
  createdAt: string
}

type FormState = {
  title: string
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

function safeImageSrc(value: string) {
  return isValidImageUrl(value) ? safeText(value) : "/images/image.png"
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

export default function AdminGalleryClient() {
  const [items, setItems] = useState<PhotoReport[]>([])
  const [form, setForm] = useState<FormState>({ title: "", imageUrl: "" })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return safeText(form.title).length > 0 && isValidImageUrl(form.imageUrl)
  }, [form])

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiJson<PhotoReport[]>("/api/photo-reports")
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
      await apiJson<PhotoReport>("/api/photo-reports", {
        method: "POST",
        body: JSON.stringify({
          title: safeText(form.title),
          imageUrl: safeText(form.imageUrl),
        }),
      })

      setForm({ title: "", imageUrl: "" })
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
      const res = await fetch(`/api/photo-reports/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.text())
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка удаления")
    }
  }

  return (
    <div className="grid gap-8">
      <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
        <div className="text-lg font-semibold text-gray-900">Добавить фотоотчёт</div>

        <UploadPhotoClient targetInputId="imageUrl" />

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-4 grid gap-3 md:max-w-2xl">
          <input
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Название"
            className="h-11 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300"
            required
          />
          <input
            id="imageUrl"
            value={form.imageUrl}
            onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
            placeholder="URL картинки (https://… или /uploads/… или /images/…)"
            className="h-11 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300"
            required
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
            {isSaving ? "Сохранение..." : "Сохранить"}
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
        <div className="text-lg font-semibold text-gray-900">Список</div>
        <div className="mt-1 text-sm text-gray-600">Редактирование и удаление фотоотчётов.</div>

        {isLoading ? <div className="mt-4 text-sm text-gray-600">Загрузка...</div> : null}

        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {items.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-2xl border border-indigo-100 bg-white">
              <div className="relative aspect-[4/3]">
                <Image src={safeImageSrc(p.imageUrl)} alt={p.title} fill className="object-cover" />
              </div>

              <div className="p-4">
                <div className="text-sm font-semibold text-gray-900 line-clamp-2">{p.title}</div>

                {!isValidImageUrl(p.imageUrl) ? (
                  <div className="mt-1 text-xs font-semibold text-rose-700">Некорректный URL картинки</div>
                ) : (
                  <div className="mt-1 text-xs text-gray-500">
                    {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(new Date(p.createdAt))}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`/admin/gallery/${p.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-indigo-100 bg-white px-3 text-xs font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50"
                  >
                    Редактировать
                  </Link>

                  <button
                    type="button"
                    onClick={() => void onDelete(p.id)}
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
