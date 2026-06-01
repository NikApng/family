import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { safeImageSrc } from "@/lib/imageUrl"

export const dynamic = "force-dynamic"

type Event = {
  id: string
  title: string
  description: string
  date: Date
  place: string | null
  imageUrl: string | null
}

type StatusBadge = {
  text: string
  bg: string
  text_color: string
}

function getStatusBadge(date: Date, now: Date): StatusBadge {
  const diffMs = date.getTime() - now.getTime()
  const diffH = diffMs / (1000 * 60 * 60)

  if (diffH < 0) return { text: "Прошло", bg: "bg-gray-200/90", text_color: "text-gray-600" }
  if (diffH < 24) return { text: "Сегодня!", bg: "bg-emerald-500", text_color: "text-white" }
  if (diffH < 48) return { text: "Завтра", bg: "bg-lime-500", text_color: "text-white" }
  if (diffH < 168) return { text: "Скоро", bg: "bg-amber-400", text_color: "text-amber-900" }
  return {
    text: new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(date),
    bg: "bg-indigo-100",
    text_color: "text-indigo-700",
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(date)
}

function groupByMonth(events: Event[]): [string, Event[]][] {
  const map = new Map<string, Event[]>()
  for (const e of events) {
    const key = new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(e.date)
    const arr = map.get(key) ?? []
    arr.push(e)
    map.set(key, arr)
  }
  return Array.from(map.entries())
}

export default async function EventsPage() {
  const now = new Date()

  const [upcoming, past] = await Promise.all([
    prisma.event.findMany({
      orderBy: { date: "asc" },
      where: { date: { gte: now } },
    }),
    prisma.event.findMany({
      orderBy: { date: "desc" },
      where: { date: { lt: now } },
    }),
  ])

  const featured = upcoming[0] ?? null
  const restUpcoming = upcoming.slice(1)
  const pastGroups = groupByMonth(past)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">

      {/* Page header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Афиша</h1>
        <p className="mt-2 text-gray-500">Ближайшие события и история прошедших мероприятий</p>
      </div>

      {/* ── UPCOMING ─────────────────────────────────────── */}
      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 py-16 text-center">
          <div className="text-5xl">📅</div>
          <div className="mt-4 text-lg font-semibold text-gray-500">Ближайших мероприятий пока нет</div>
          <div className="mt-1 text-sm text-gray-400">Следите за обновлениями — скоро появятся новые события</div>
        </div>
      ) : (
        <section>
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-600">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Ближайшие
            </span>
            <div className="h-px flex-1 bg-indigo-50" />
          </div>

          {/* Featured — next event */}
          {featured && (() => {
            const badge = getStatusBadge(featured.date, now)
            return (
              <Link href={`/events/${featured.id}`} className="group relative mb-6 block overflow-hidden rounded-3xl shadow-md transition hover:shadow-xl">
                <div className="aspect-21/9 w-full overflow-hidden">
                  <img
                    src={safeImageSrc(featured.imageUrl, "/images/image.png")}
                    alt={featured.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${badge.bg} ${badge.text_color}`}>
                    {badge.text}
                  </span>
                  <div className="mt-3 text-2xl font-bold text-white drop-shadow sm:text-3xl">{featured.title}</div>
                  <div className="mt-1.5 text-sm text-white/70">
                    {formatDate(featured.date)}{featured.place ? ` · ${featured.place}` : ""}
                  </div>
                  <div className="mt-3 max-w-2xl text-sm leading-relaxed text-white/80 line-clamp-2">{featured.description}</div>
                  <div className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-white/20 px-5 text-sm font-semibold text-white backdrop-blur transition group-hover:bg-white/30">
                    Подробнее <span className="transition group-hover:translate-x-0.5">→</span>
                  </div>
                </div>
              </Link>
            )
          })()}

          {/* Rest upcoming grid */}
          {restUpcoming.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {restUpcoming.map((e) => {
                const badge = getStatusBadge(e.date, now)
                return (
                  <Link
                    key={e.id}
                    href={`/events/${e.id}`}
                    className="group overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={safeImageSrc(e.imageUrl, "/images/image.png")}
                        alt={e.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
                      <span className={`absolute bottom-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-bold ${badge.bg} ${badge.text_color}`}>
                        {badge.text}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="text-xs text-gray-500">
                        {formatDate(e.date)}{e.place ? ` · ${e.place}` : ""}
                      </div>
                      <div className="mt-1.5 font-semibold text-gray-900 line-clamp-2">{e.title}</div>
                      <div className="mt-1 text-sm text-gray-600 line-clamp-2">{e.description}</div>
                      <div className="mt-3 text-xs font-semibold text-indigo-600 transition group-hover:translate-x-0.5">
                        Открыть →
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* ── PAST ─────────────────────────────────────────── */}
      {past.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-center gap-3">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-widest text-gray-500">
              История мероприятий
            </span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          <div className="space-y-10">
            {pastGroups.map(([month, events]) => (
              <div key={month}>
                {/* Month separator */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="text-sm font-semibold capitalize text-gray-400">{month}</div>
                  <div className="h-px flex-1 bg-gray-100" />
                  <div className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-400">{events.length}</div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {events.map((e) => (
                    <Link
                      key={e.id}
                      href={`/events/${e.id}`}
                      className="group overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 transition hover:border-gray-200 hover:shadow-sm"
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={safeImageSrc(e.imageUrl, "/images/image.png")}
                          alt={e.title}
                          className="h-full w-full object-cover opacity-70 grayscale-20 transition duration-300 group-hover:opacity-80"
                        />
                        <div className="absolute inset-0 bg-black/15" />
                        <span className="absolute bottom-3 left-3 rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-semibold text-gray-600 backdrop-blur-sm">
                          Прошло
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="text-xs text-gray-400">
                          {formatDate(e.date)}{e.place ? ` · ${e.place}` : ""}
                        </div>
                        <div className="mt-1.5 font-semibold text-gray-700 line-clamp-2">{e.title}</div>
                        <div className="mt-1 text-sm text-gray-500 line-clamp-2">{e.description}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All empty */}
      {upcoming.length === 0 && past.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <div className="text-sm text-gray-400">Мероприятий пока нет</div>
        </div>
      )}
    </div>
  )
}
