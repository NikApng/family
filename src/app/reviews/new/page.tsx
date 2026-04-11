import Link from "next/link"
import { Section } from "@/components/Section"
// import { ReviewForm } from "@/components/Reviews/ReviewForm"

export default function NewReviewPage() {
  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Section title="Отправка отзывов отключена" subtitle="В целях приватности сбор отзывов через сайт отключён.">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/reviews"
            className="inline-flex h-10 items-center justify-center rounded-md border border-indigo-100 bg-white px-4 text-sm font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50"
          >
            ← Все отзывы
          </Link>
        </div>

        <div className="mt-6 rounded-3xl border border-amber-100 bg-amber-50 p-7 shadow-sm">
          <div className="text-lg font-semibold text-gray-900">Форма больше не собирает данные</div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-700">
            Мы отключили отправку имени, текста отзыва и других полей через сайт. Если нужно связаться с организацией,
            используйте прямые контакты без веб-формы.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/contacts"
              className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Контакты
            </Link>
          </div>

          {/*
          <ReviewForm />
          */}
        </div>
      </Section>
    </div>
  )
}
