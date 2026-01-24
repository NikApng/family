import Link from "next/link"
import { prisma } from "@/lib/prisma"

function isValidImageUrl(value: string) {
  const v = String(value ?? "").trim()
  if (!v) return false

  return v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/uploads/") || v.startsWith("/images/")
}

function safeImageSrc(value: string | null) {
  const v = String(value ?? "").trim()
  return isValidImageUrl(v) ? v : "/images/image.png"
}

export default async function EventsPage() {
  const cutoff = new Date()
  cutoff.setTime(cutoff.getTime() - 24 * 60 * 60 * 1000)

  const items = await prisma.event.findMany({
    orderBy: { date: "asc" },
    where: { date: { gte: cutoff } },
  })

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-gray-900">Афиша</h1>
      <div className="mt-2 text-sm text-gray-600">Ближайшие встречи и события.</div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((e) => (
          <Link
            key={e.id}
            href={`/events/${e.id}`}
            className="group overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
          >
            <div className="aspect-[16/9] border-b border-indigo-100 bg-white">
              <img src={safeImageSrc(e.imageUrl)} alt={e.title} className="h-full w-full object-cover" />
            </div>

            <div className="p-6">
              <div className="text-xs font-semibold text-gray-600">
                {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(e.date)}
                {e.place ? ` • ${e.place}` : ""}
              </div>
              <div className="mt-2 text-lg font-semibold text-gray-900">{e.title}</div>
              <div className="mt-2 text-sm text-gray-700 line-clamp-3">{e.description}</div>

              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700">
                Открыть <span className="transition group-hover:translate-x-0.5">→</span>
              </div>
            </div>
          </Link>
        ))}

        {!items.length ? <div className="text-sm text-gray-600">Пока нет ближайших событий.</div> : null}
      </div>
    </div>
  )
}

