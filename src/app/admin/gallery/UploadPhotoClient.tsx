"use client"

import { useRef, useState } from "react"

type Props = {
  targetInputId: string
}

type UploadResponse = {
  ok: boolean
  url?: string
}

export default function UploadPhotoClient({ targetInputId }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upload = async () => {
    const file = inputRef.current?.files?.[0]
    const urlInput = document.getElementById(targetInputId) as HTMLInputElement | null

    if (!file || !urlInput) return

    setIsLoading(true)
    setError(null)

    try {
      const fd = new FormData()
      fd.append("file", file)

      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const json = (await res.json()) as UploadResponse

      if (!json.ok || !json.url) {
        setError("Не удалось загрузить файл")
        return
      }

      urlInput.value = json.url
    } catch {
      setError("Ошибка загрузки")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
      <div className="text-sm font-semibold text-gray-900">Загрузка файла</div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input ref={inputRef} type="file" accept="image/*" className="text-sm" />

        <button
          type="button"
          onClick={upload}
          disabled={isLoading}
          className="inline-flex h-10 items-center justify-center rounded-md border border-indigo-100 bg-white px-4 text-sm font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50 disabled:opacity-60"
        >
          {isLoading ? "Загрузка..." : "Загрузить"}
        </button>

        <div className="text-xs text-gray-600">Файл сохранится в public/uploads</div>
      </div>

      {error ? <div className="mt-2 text-xs font-semibold text-rose-700">{error}</div> : null}
    </div>
  )
}
