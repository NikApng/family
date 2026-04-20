export const BADGE_TONES = [
  { value: "indigo", label: "Синий", swatch: "bg-indigo-500", preview: "bg-indigo-100 text-indigo-700" },
  { value: "rose", label: "Розовый", swatch: "bg-rose-500", preview: "bg-rose-100 text-rose-700" },
  { value: "amber", label: "Жёлтый", swatch: "bg-amber-500", preview: "bg-amber-100 text-amber-800" },
  { value: "emerald", label: "Зелёный", swatch: "bg-emerald-500", preview: "bg-emerald-100 text-emerald-700" },
  { value: "sky", label: "Голубой", swatch: "bg-sky-500", preview: "bg-sky-100 text-sky-700" },
  { value: "violet", label: "Фиолетовый", swatch: "bg-violet-500", preview: "bg-violet-100 text-violet-700" },
  { value: "slate", label: "Серый", swatch: "bg-slate-500", preview: "bg-slate-100 text-slate-700" },
] as const

export type BadgeTone = (typeof BADGE_TONES)[number]["value"]

export function isBadgeTone(value: string): value is BadgeTone {
  return BADGE_TONES.some((tone) => tone.value === value)
}

export function safeBadgeTone(value: string | null | undefined): BadgeTone {
  const tone = String(value ?? "")
  return isBadgeTone(tone) ? tone : "indigo"
}
