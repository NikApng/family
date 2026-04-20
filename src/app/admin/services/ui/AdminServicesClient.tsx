"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

type ServiceBlock = {
  title: string
  text: string
}

type ServiceItem = {
  id: string
  slug: string
  title: string
  intro: string
  blocks: unknown
  isPublished: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

type FormState = {
  slug: string
  title: string
  intro: string
  isPublished: boolean
  sortOrder: number
  blocks: ServiceBlock[]
}

const fieldClass =
  "h-11 w-full rounded-md border border-indigo-100 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"

const textareaClass =
  "w-full rounded-md border border-indigo-100 bg-white px-3 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"

function safeText(v: unknown) {
  return String(v ?? "").trim()
}

function normalizeSlug(value: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-|\-$/g, "")
}

function toBlocks(value: unknown): ServiceBlock[] {
  if (!Array.isArray(value)) return []

  const blocks: ServiceBlock[] = []
  for (const item of value) {
    if (!item || typeof item !== "object") continue
    const block = item as Record<string, unknown>
    const title = safeText(block.title)
    const text = safeText(block.text)
    if (!title && !text) continue
    blocks.push({ title, text })
  }

  return blocks
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

export default function AdminServicesClient() {
  const [items, setItems] = useState<ServiceItem[]>([])
  const [form, setForm] = useState<FormState>({
    slug: "",
    title: "",
    intro: "",
    isPublished: true,
    sortOrder: 0,
    blocks: [{ title: "", text: "" }],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    const slug = normalizeSlug(form.slug)
    const title = safeText(form.title)
    const intro = safeText(form.intro)
    return slug.length > 0 && title.length > 0 && intro.length > 0
  }, [form])

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiJson<ServiceItem[]>("/api/services")
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

  const onSeed = async () => {
    setIsSeeding(true)
    setError(null)
    try {
      await apiJson<{ ok: boolean }>("/api/services/seed", { method: "POST" })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка заполнения")
    } finally {
      setIsSeeding(false)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setIsSaving(true)
    setError(null)

    try {
      await apiJson<ServiceItem>("/api/services", {
        method: "POST",
        body: JSON.stringify({
          slug: normalizeSlug(form.slug),
          title: safeText(form.title),
          intro: safeText(form.intro),
          isPublished: Boolean(form.isPublished),
          sortOrder: Number(form.sortOrder ?? 0),
          blocks: form.blocks.map((b) => ({ title: safeText(b.title), text: safeText(b.text) })),
        }),
      })

      setForm({
        slug: "",
        title: "",
        intro: "",
        isPublished: true,
        sortOrder: 0,
        blocks: [{ title: "", text: "" }],
      })

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
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.text())
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка удаления")
    }
  }

  const blocks = form.blocks

  return (
    <div className="grid gap-8">
      <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-gray-900">Услуги</div>
            <div className="mt-1 text-sm text-gray-600">Создание и управление услугами для страницы /services.</div>
          </div>

          <button
            type="button"
            onClick={() => void onSeed()}
            disabled={isSeeding}
            className="inline-flex h-10 items-center justify-center rounded-md border border-indigo-100 bg-white px-4 text-sm font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-60"
          >
            {isSeeding ? "Заполнение..." : "Заполнить стандартными"}
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 grid gap-5">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
            <div className="text-base font-semibold text-gray-900">1. Карточка услуги на сайте</div>
            <div className="mt-1 text-sm text-gray-600">
              Эти поля видны в списке услуг и помогают посетителю выбрать подходящее направление.
            </div>

            <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
              <div className="grid grid-rows-[auto_44px_auto] gap-2">
                <div className="text-sm font-semibold text-gray-900">Ссылка</div>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: normalizeSlug(e.target.value) }))}
                  onBlur={() => setForm((p) => ({ ...p, slug: normalizeSlug(p.slug) }))}
                  placeholder="online"
                  className={fieldClass}
                  required
                />
                <div className="text-xs text-gray-500">
                  Адрес будет: /services/{normalizeSlug(form.slug) || "..."}; используйте латиницу.
                </div>
              </div>

              <div className="grid grid-rows-[auto_44px_auto] gap-2">
                <div className="text-sm font-semibold text-gray-900">Сортировка</div>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
                  className={fieldClass}
                />
                <div className="text-xs text-gray-500">Чем меньше число, тем выше услуга в списке.</div>
              </div>
            </div>

            <div className="mt-4 grid gap-4">
              <div className="grid gap-2">
                <div className="text-sm font-semibold text-gray-900">Название</div>
                <input
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className={fieldClass}
                  required
                />
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-semibold text-gray-900">Короткое описание для карточки</div>
                <textarea
                  value={form.intro}
                  onChange={(e) => setForm((p) => ({ ...p, intro: e.target.value }))}
                  className={`${textareaClass} min-h-24`}
                  required
                />
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-gray-900">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
                  className="h-4 w-4"
                />
                Опубликовать на сайте
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
            <div className="text-base font-semibold text-gray-900">2. Внутренняя страница услуги</div>
            <div className="mt-1 text-sm text-gray-600">
              Эти блоки появятся после перехода в карточку услуги.
            </div>
            <div className="mt-3 grid gap-3">
              {blocks.map((b, idx) => (
                <div key={idx} className="rounded-2xl border border-indigo-100 bg-white p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={b.title}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          blocks: p.blocks.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)),
                        }))
                      }
                      placeholder="Заголовок"
                      className={fieldClass}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          blocks: p.blocks.length > 1 ? p.blocks.filter((_, i) => i !== idx) : [{ title: "", text: "" }],
                        }))
                      }
                      className="inline-flex h-10 items-center justify-center rounded-md border border-rose-100 bg-rose-50 px-4 text-sm font-semibold text-rose-700 hover:border-rose-200"
                    >
                      Удалить блок
                    </button>
                  </div>

                  <textarea
                    value={b.text}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        blocks: p.blocks.map((x, i) => (i === idx ? { ...x, text: e.target.value } : x)),
                      }))
                    }
                    placeholder="Текст"
                    className={`${textareaClass} mt-3 min-h-24`}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, blocks: [...p.blocks, { title: "", text: "" }] }))}
              className="mt-3 inline-flex h-10 items-center justify-center rounded-md border border-indigo-100 bg-white px-4 text-sm font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50"
            >
              Добавить блок
            </button>
          </div>

          <button
            disabled={!canSubmit || isSaving}
            className="h-11 rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSaving ? "Сохранение..." : "Создать услугу"}
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
        <div className="text-lg font-semibold text-gray-900">Список</div>
        <div className="mt-1 text-sm text-gray-600">Редактирование и удаление услуг.</div>

        {isLoading ? <div className="mt-4 text-sm text-gray-600">Загрузка...</div> : null}

        <div className="mt-4 grid gap-3">
          {items.map((s) => {
            const blocksCount = toBlocks(s.blocks).length
            return (
              <div key={s.id} className="rounded-2xl border border-indigo-100 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900">{s.title}</div>
                    <div className="mt-1 text-xs text-gray-500">
                      /services/{s.slug} • блоков: {blocksCount} • {s.isPublished ? "опубликовано" : "черновик"} • порядок:{" "}
                      {s.sortOrder}
                    </div>
                    <div className="mt-2 text-sm text-gray-700 line-clamp-2">{s.intro}</div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/admin/services/${s.id}`}
                      className="inline-flex h-9 items-center justify-center rounded-md border border-indigo-100 bg-white px-3 text-xs font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50"
                    >
                      Редактировать
                    </Link>

                    <button
                      type="button"
                      onClick={() => void onDelete(s.id)}
                      className="inline-flex h-9 items-center justify-center rounded-md border border-rose-100 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:border-rose-200"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {!isLoading && !items.length ? <div className="text-sm text-gray-600">Пока пусто.</div> : null}
        </div>
      </div>
    </div>
  )
}
