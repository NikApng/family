"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { BADGE_TONES, type BadgeTone, safeBadgeTone } from "@/lib/badgeTones"

type BadgeToneSelectProps = {
  defaultValue?: string | null
  name?: string
}

export function BadgeToneSelect({ defaultValue = "indigo", name = "badgeTone" }: BadgeToneSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [value, setValue] = useState<BadgeTone>(() => safeBadgeTone(defaultValue))

  const selected = useMemo(() => BADGE_TONES.find((tone) => tone.value === value) ?? BADGE_TONES[0], [value])

  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false)
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={value} />

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between rounded-md border border-indigo-100 bg-white px-3 text-left text-sm text-gray-900 shadow-sm outline-none transition hover:border-indigo-200 focus-visible:ring-2 focus-visible:ring-indigo-300"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className={`h-4 w-4 shrink-0 rounded-full ${selected.swatch}`} />
          <span className={`truncate rounded-full px-2.5 py-1 text-xs font-semibold ${selected.preview}`}>
            {selected.label}
          </span>
        </span>
        <span
          className={[
            "ml-3 h-2 w-2 shrink-0 rotate-45 border-b-2 border-r-2 border-gray-500 transition",
            isOpen ? "translate-y-0.5 rotate-[225deg]" : "-translate-y-0.5",
          ].join(" ")}
          aria-hidden
        />
      </button>

      {isOpen ? (
        <div
          role="listbox"
          className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-md border border-indigo-100 bg-white p-1 shadow-lg"
        >
          {BADGE_TONES.map((tone) => {
            const isSelected = tone.value === value

            return (
              <button
                key={tone.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setValue(tone.value)
                  setIsOpen(false)
                }}
                className={[
                  "flex h-11 w-full items-center gap-3 rounded px-3 text-left text-sm transition",
                  isSelected ? "bg-indigo-50 font-semibold text-gray-900" : "text-gray-800 hover:bg-indigo-50",
                ].join(" ")}
              >
                <span className={`h-4 w-4 shrink-0 rounded-full ${tone.swatch}`} />
                <span>{tone.label}</span>
                <span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ${tone.preview}`}>
                  Пример
                </span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
