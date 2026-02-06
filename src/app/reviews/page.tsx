import Link from "next/link"
import { Section } from "@/components/Section"
import { getApprovedReviews } from "@/lib/reviews"
import { ReviewCard } from "@/components/Reviews/ReviewCard"

export const dynamic = "force-dynamic"

const TINTS = ["rose", "indigo", "amber"] as const

export default async function ReviewsPage() {
  const items = await getApprovedReviews(60)

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Section title="Отзывы клиентов" subtitle="Здесь показываем только подтверждённые отзывы.">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-600">Хотите поделиться впечатлением?</div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-md border border-indigo-100 bg-white px-5 text-sm font-semibold text-gray-900 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:shadow"
            >
              На главную
            </Link>
            <Link
              href="/reviews/new"
              className="inline-flex h-11 items-center justify-center rounded-md bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow"
            >
              Оставить отзыв
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((x, idx) => (
            <ReviewCard
              key={x.id}
              tint={TINTS[idx % TINTS.length]}
              text={x.text}
              authorName={x.authorName}
              isAnonymous={x.isAnonymous}
              rating={x.rating}
            />
          ))}

          {!items.length ? (
            <div className="rounded-3xl border border-indigo-100 bg-white p-7 text-sm text-gray-700 shadow-sm">
              Пока нет опубликованных отзывов.
            </div>
          ) : null}
        </div>
      </Section>
    </div>
  )
}
