"use client"

import { useRef, useState } from "react"

type Props = {
  targetInputId: string
}

type UploadResponse = {
  ok: boolean
  url?: string
  error?: string
}

function uploadErrorMessage(code?: string, status?: number) {
  if (code === "UNAUTHORIZED") return "Сессия истекла. Перезайдите в админку."
  if (code === "FILE_REQUIRED") return "Сначала выберите файл."
  if (code === "INVALID_FILE_TYPE") return "Разрешены только изображения."
  if (code === "FILE_TOO_LARGE") return "Файл слишком большой. Лимит — 8 МБ."
  if (code === "STORAGE_WRITE_FAILED") {
    return "Сервер не смог сохранить файл. Используйте внешнюю ссылку (https://...) или настройте облачное хранилище."
  }
  if (status) return `Ошибка загрузки (HTTP ${status}).`
  return "Ошибка загрузки."
}

export default function UploadPhotoClient({ targetInputId }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async () => {
    const fileInput = inputRef.current
    const file = fileInput?.files?.[0]
    const urlInput = document.getElementById(targetInputId) as HTMLInputElement | null

    if (!urlInput) {
      setError("Не найдено поле для URL картинки")
      return
    }

    if (!fileInput) return

    if (!file) {
      setError("Сначала выберите файл")
      fileInput.click()
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const fd = new FormData()
      fd.append("file", file)

      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const json = (await res.json().catch(() => null)) as UploadResponse | null

      if (!res.ok || !json?.ok || !json.url) {
        setError(uploadErrorMessage(json?.error, res.status))
        return
      }

      urlInput.value = json.url
      urlInput.dispatchEvent(new Event("input", { bubbles: true }))
    } catch {
      setError("Ошибка загрузки")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
      <div className="text-sm font-semibold text-gray-900">Загрузка файла</div>

      <div className="mt-3 grid gap-3 sm:flex sm:flex-wrap sm:items-center">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={() => setError(null)}
          className="w-full min-w-0 max-w-full text-sm sm:w-auto"
        />

        <button
          type="button"
          onClick={upload}
          disabled={isLoading}
          className="inline-flex h-10 items-center justify-center rounded-md border border-indigo-100 bg-white px-4 text-sm font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-60"
        >
          {isLoading ? "Загрузка..." : "Загрузить"}
        </button>

        <div className="text-xs text-gray-600">Файл сохранится в хранилище сервера и будет доступен по /uploads/...</div>
      </div>

      {error ? <div className="mt-2 text-xs font-semibold text-rose-700">{error}</div> : null}
    </div>
  )
}
