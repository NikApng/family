import Link from "next/link"
import { getApprovedReviews } from "@/lib/reviews"
import { ReviewCard } from "./ReviewCard"

const TINTS = ["rose", "indigo", "amber"] as const

export default async function ReviewsSection() {
  const items = await getApprovedReviews(6)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-gray-600">Показываем только подтверждённые отзывы.</div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/reviews"
            className="inline-flex h-11 items-center justify-center rounded-md border border-indigo-100 bg-white px-5 text-sm font-semibold text-gray-900 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:shadow"
          >
            Все отзывы
          </Link>
          <Link
            href="/reviews/new"
            className="inline-flex h-11 items-center justify-center rounded-md bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow"
          >
            Оставить отзыв
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {items.map((x, idx) => (
          <ReviewCard
            key={x.id}
            tint={TINTS[idx % TINTS.length]}
            text={x.text}
            authorName={x.authorName}
            isAnonymous={x.isAnonymous}
            rating={x.rating}
            compact
          />
        ))}

        {!items.length ? (
          <div className="rounded-3xl border border-indigo-100 bg-white p-7 text-sm text-gray-700 shadow-sm">
            Пока нет опубликованных отзывов.
          </div>
        ) : null}
      </div>
    </div>
  )
}

