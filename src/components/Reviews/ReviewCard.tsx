type ReviewTint = "rose" | "indigo" | "amber"

type ReviewCardProps = {
  text: string
  authorName: string | null
  isAnonymous: boolean
  rating: number | null
  tint: ReviewTint
  compact?: boolean
}

function stars(rating: number) {
  const full = "★".repeat(Math.max(0, Math.min(5, rating)))
  const empty = "☆".repeat(Math.max(0, 5 - Math.max(0, Math.min(5, rating))))
  return full + empty
}

export function ReviewCard({ text, authorName, isAnonymous, rating, tint, compact }: ReviewCardProps) {
  const bg =
    tint === "rose"
      ? "from-white to-rose-50/70 border-rose-100 hover:border-rose-200"
      : tint === "indigo"
        ? "from-white to-indigo-50/70 border-indigo-100 hover:border-indigo-200"
        : "from-white to-amber-50/70 border-amber-100 hover:border-amber-200"

  const glow =
    tint === "rose"
      ? "bg-rose-200/40"
      : tint === "indigo"
        ? "bg-indigo-200/40"
        : "bg-amber-200/50"

  const author = isAnonymous || !authorName ? "Анонимно" : authorName

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border bg-gradient-to-b p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${bg}`}
    >
      <div className={`pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full blur-2xl ${glow}`} />
      <div className="relative">
        <div className={`text-sm leading-relaxed text-gray-800 ${compact ? "line-clamp-6" : ""}`}>
          &ldquo;{text}&rdquo;
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-gray-600">
          <div>{author}</div>
          {rating ? <div className="font-semibold text-amber-600">{stars(rating)}</div> : null}
        </div>
      </div>
    </div>
  )
}

