import Link from "next/link"
import { Section } from "@/components/Section"
import { ReviewForm } from "@/components/Reviews/ReviewForm"

export default function NewReviewPage() {
  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Section title="Оставить отзыв" subtitle="Текст обязателен. Новый отзыв появится на сайте после модерации.">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/reviews"
            className="inline-flex h-10 items-center justify-center rounded-md border border-indigo-100 bg-white px-4 text-sm font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50"
          >
            ← Все отзывы
          </Link>
        </div>

        <div className="mt-6 rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
          <ReviewForm />
        </div>
      </Section>
    </div>
  )
}

