import { prisma } from "@/lib/prisma"

export default async function EventsPage() {
  const items = await prisma.event.findMany({
    orderBy: { date: "asc" },
    where: { date: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  })

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-gray-900">Афиша</h1>
      <div className="mt-2 text-sm text-gray-600">Ближайшие встречи и события.</div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((e) => (
          <div key={e.id} className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
            <div className="text-xs font-semibold text-gray-600">
              {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(e.date)}
              {e.place ? ` • ${e.place}` : ""}
            </div>
            <div className="mt-2 text-lg font-semibold text-gray-900">{e.title}</div>
            <div className="mt-2 text-sm text-gray-700">{e.description}</div>
          </div>
        ))}

        {!items.length ? <div className="text-sm text-gray-600">Пока нет ближайших событий.</div> : null}
      </div>
    </div>
  )
}
