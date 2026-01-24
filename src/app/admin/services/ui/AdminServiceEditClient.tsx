"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

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
}

type FormState = {
  slug: string
  title: string
  intro: string
  isPublished: boolean
  sortOrder: number
  blocks: ServiceBlock[]
}

function safeText(v: unknown) {
  return String(v ?? "").trim()
}

function normalizeSlug(value: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-|\-$/g, "")
}

function toBlocks(value: unknown): ServiceBlock[] {
  if (!Array.isArray(value)) return []

  const blocks: ServiceBlock[] = []
  for (const item of value) {
    if (!item || typeof item !== "object") continue
    const title = safeText((item as any).title)
    const text = safeText((item as any).text)
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

type Props = {
  id: string
}

export default function AdminServiceEditClient({ id }: Props) {
  const router = useRouter()
  const [item, setItem] = useState<ServiceItem | null>(null)
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
  const [error, setError] = useState<string | null>(null)

  const canSubmit = useMemo(() => {
    const slug = normalizeSlug(form.slug)
    const title = safeText(form.title)
    const intro = safeText(form.intro)
    return slug.length > 0 && title.length > 0 && intro.length > 0
  }, [form])

  const load = async () => {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiJson<ServiceItem>(`/api/services/${id}`)
      setItem(data)
      setForm({
        slug: data.slug,
        title: data.title,
        intro: data.intro,
        isPublished: Boolean(data.isPublished),
        sortOrder: Number(data.sortOrder ?? 0),
        blocks: toBlocks(data.blocks).length ? toBlocks(data.blocks) : [{ title: "", text: "" }],
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
      await apiJson<ServiceItem>(`/api/services/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          slug: normalizeSlug(form.slug),
          title: safeText(form.title),
          intro: safeText(form.intro),
          isPublished: Boolean(form.isPublished),
          sortOrder: Number(form.sortOrder ?? 0),
          blocks: form.blocks.map((b) => ({ title: safeText(b.title), text: safeText(b.text) })),
        }),
      })

      router.push("/admin/services")
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
      const res = await fetch(`/api/services/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(await res.text())
      router.push("/admin/services")
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка удаления")
    }
  }

  if (isLoading) return <div className="text-sm text-gray-600">Загрузка...</div>

  const publicHref = normalizeSlug(form.slug) ? `/services/${normalizeSlug(form.slug)}` : ""

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Редактировать услугу</h1>
          <div className="mt-1 text-sm text-gray-600">{item?.title ?? ""}</div>
        </div>

        <div className="flex items-center gap-2">
          {publicHref ? (
            <Link
              href={publicHref}
              className="inline-flex h-10 items-center justify-center rounded-md border border-indigo-100 bg-white px-4 text-sm font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50"
            >
              На сайт
            </Link>
          ) : null}

          <Link
            href="/admin/services"
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
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>
      ) : null}

      <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
        <form onSubmit={onSubmit} className="grid gap-4 md:max-w-3xl">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-2">
              <div className="text-sm font-semibold text-gray-900">Slug</div>
              <input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                onBlur={() => setForm((p) => ({ ...p, slug: normalizeSlug(p.slug) }))}
                className="h-11 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300"
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-semibold text-gray-900">Сортировка</div>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
                className="h-11 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-semibold text-gray-900">Название</div>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="h-11 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300"
              required
            />
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-semibold text-gray-900">Вступление</div>
            <textarea
              value={form.intro}
              onChange={(e) => setForm((p) => ({ ...p, intro: e.target.value }))}
              className="min-h-24 rounded-md border border-indigo-100 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-300"
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
            Опубликовать
          </label>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
            <div className="text-sm font-semibold text-gray-900">Блоки</div>
            <div className="mt-3 grid gap-3">
              {form.blocks.map((b, idx) => (
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
                      className="h-10 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300"
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
                    className="mt-3 min-h-24 w-full rounded-md border border-indigo-100 bg-white px-3 py-3 text-sm outline-none focus:border-indigo-300"
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
            {isSaving ? "Сохранение..." : "Сохранить изменения"}
          </button>
        </form>
      </div>
    </div>
  )
}

