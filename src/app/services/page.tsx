import Link from "next/link"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function ServicesPage() {
  const items = await prisma.service.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: { slug: true, title: true, intro: true },
  })

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-semibold text-gray-900">Услуги</h1>
        <div className="mt-2 text-sm text-gray-600">Направления поддержки и форматы помощи.</div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {items.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <div className="text-lg font-semibold text-gray-900">{service.title}</div>
              <div className="mt-2 text-sm leading-relaxed text-gray-700">{service.intro}</div>

              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700">
                Подробнее <span className="transition group-hover:translate-x-0.5">→</span>
              </div>
            </Link>
          ))}

          {!items.length ? (
            <div className="rounded-3xl border border-indigo-100 bg-white p-6 text-sm text-gray-600 shadow-sm">
              Пока нет опубликованных услуг.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
