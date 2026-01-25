"use client"

import { useRef, useState } from "react"

type ApiResult = { ok: true } | { ok: false; error?: string }

function safeText(v: FormDataEntryValue | null) {
  return String(v ?? "").trim()
}

export function ReviewForm() {
  const formRef = useRef<HTMLFormElement | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<null | { ok: true } | { ok: false; message: string }>(null)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setStatus(null)

    try {
      const formData = new FormData(e.currentTarget)

      const payload = {
        name: safeText(formData.get("name")),
        text: safeText(formData.get("text")),
        rating: safeText(formData.get("rating")) ? Number(safeText(formData.get("rating"))) : null,
        isAnonymous: safeText(formData.get("isAnonymous")) === "true",
        website: safeText(formData.get("website")),
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = (await res.json()) as ApiResult

      if (!data.ok) {
        const message =
          data.error === "rate_limited"
            ? "Слишком часто. Попробуйте ещё раз через 10 минут."
            : data.error === "validation"
              ? "Проверьте данные: текст 20–1000, имя до 60, рейтинг 1–5 или пусто."
              : "Не удалось отправить отзыв. Попробуйте позже."

        setStatus({ ok: false, message })
        return
      }

      formRef.current?.reset()
      setStatus({ ok: true })
    } catch {
      setStatus({ ok: false, message: "Не удалось отправить отзыв. Попробуйте позже." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="grid gap-4 md:max-w-2xl">
      {status?.ok ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          Спасибо! Отзыв отправлен на модерацию и появится на сайте после подтверждения.
        </div>
      ) : null}

      {status && !status.ok ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {status.message}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-xs font-semibold text-gray-600">Имя (необязательно)</label>
          <input
            name="name"
            maxLength={60}
            placeholder="Как к вам обращаться"
            className="h-11 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-semibold text-gray-600">Рейтинг (необязательно)</label>
          <select
            name="rating"
            defaultValue=""
            className="h-11 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">Без оценки</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-xs font-semibold text-gray-600">Отзыв</label>
        <textarea
          name="text"
          required
          minLength={20}
          maxLength={1000}
          placeholder="Напишите, что вам помогло (20–1000 символов)"
          className="min-h-32 rounded-md border border-indigo-100 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-200"
        />
        <div className="text-xs text-gray-500">Новые отзывы не публикуются автоматически — сначала модерация.</div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="isAnonymous"
          value="true"
          className="h-4 w-4 rounded border-indigo-200 text-indigo-600 focus:ring-indigo-200"
        />
        Публиковать анонимно
      </label>

      <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden>
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button
        disabled={isSubmitting}
        className="h-11 rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow disabled:opacity-60"
      >
        {isSubmitting ? "Отправка..." : "Отправить отзыв"}
      </button>
    </form>
  )
}

