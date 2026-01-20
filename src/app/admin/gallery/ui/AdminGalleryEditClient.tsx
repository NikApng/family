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

export default function AdminGalleryEditClient({ id }: { id: string }) {
  const [item, setItem] = useState<PhotoReport | null>(null)
  const [form, setForm] = useState<FormState>({ title: "", imageUrl: "" })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    return safeText(form.title).length > 0 && safeText(form.imageUrl).length > 0
  }, [form])

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiJson<PhotoReport>(`/api/photo-reports/${id}`)
      setItem(data)
      setForm({ title: data.title, imageUrl: data.imageUrl })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return
    void load()
  }, [id])

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setIsSaving(true)
    setError(null)
    try {
      await apiJson<PhotoReport>(`/api/photo-reports/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: safeText(form.title),
          imageUrl: safeText(form.imageUrl),
        }),
      })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения")
    } finally {
      setIsSaving(false)
    }
  }

  const onDelete = async () => {
    setError(null)
    try {
      await fetch(`/api/photo-reports/${id}`, { method: "DELETE" })
      window.location.href = "/admin/gallery"
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка удаления")
    }
  }

  if (isLoading) return <div className="text-sm text-gray-600">Загрузка...</div>
  if (!item) return <div className="text-sm text-gray-600">Не найдено.</div>

  return (
    <div className="grid gap-6">
      {error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/gallery"
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm">
          <div className="relative aspect-[4/3]">
            <Image src={form.imageUrl} alt={form.title} fill className="object-cover" />
          </div>
          <div className="p-5">
            <div className="text-sm font-semibold text-gray-900">{form.title}</div>
            <div className="mt-1 text-xs text-gray-500">
              {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.createdAt))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
          <div className="text-lg font-semibold text-gray-900">Данные</div>

          <UploadPhotoClient targetInputId="imageUrl" />

          <form onSubmit={onSave} className="mt-4 grid gap-3">
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="h-11 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300"
              required
            />
            <input
              id="imageUrl"
              value={form.imageUrl}
              onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
              className="h-11 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300"
              required
            />
            <button
              disabled={!canSubmit || isSaving}
              className="h-11 rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {isSaving ? "Сохранение..." : "Сохранить изменения"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
