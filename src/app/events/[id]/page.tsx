import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { safeImageSrc } from "@/lib/imageUrl"

export const dynamic = "force-dynamic"

type Params = Promise<{ id: string | string[] }>

function toId(value: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? ""
  return value ?? ""
}

function plainText(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id: rawId } = await params
  const id = String(toId(rawId)).trim()
  if (!id) return {}

  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) return {}

  const description = plainText(event.description).slice(0, 155) || event.title

  return {
    title: `${event.title} — Афиша`,
    description,
    openGraph: {
      title: event.title,
      description,
      type: "article",
      ...(event.imageUrl ? { images: [{ url: event.imageUrl }] } : {}),
    },
  }
}

export default async function EventPage({ params }: { params: Params }) {
  const { id: rawId } = await params
  const id = String(toId(rawId)).trim()

  if (!id) notFound()

  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) notFound()

  const poster = safeImageSrc(event.imageUrl, "/images/image.png")

  const now = new Date()
  const isPast = event.date < now

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.date.toISOString(),
    description: plainText(event.description).slice(0, 300) || event.title,
    eventStatus: isPast
      ? "https://schema.org/EventScheduled"
      : "https://schema.org/EventScheduled",
    ...(event.place
      ? { location: { "@type": "Place", name: event.place } }
      : { location: { "@type": "VirtualLocation" } }),
    ...(event.imageUrl ? { image: event.imageUrl } : {}),
    organizer: {
      "@type": "Organization",
      name: "Про Семью, Про Единство",
      url: "https://xn----dtbfcbtymkvhm7jub.xn--p1ai",
    },
  }

  return (
    <div className="bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto w-full max-w-4xl px-4 py-16">
        <Link href="/events" className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline">
          ← К афише
        </Link>

        <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          {/* Cover */}
          <div className="relative aspect-video overflow-hidden">
            <img src={poster} alt={event.title} className="h-full w-full object-cover" />
            {isPast && (
              <div className="absolute inset-0 flex items-start justify-end p-4 bg-black/10">
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-gray-600 backdrop-blur-sm">
                  Прошедшее
                </span>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
              <span>
                📅{" "}
                {new Intl.DateTimeFormat("ru-RU", { dateStyle: "long", timeStyle: "short" }).format(event.date)}
              </span>
              {event.place && <span>📍 {event.place}</span>}
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-text">{event.title}</h1>

            {/* Rich text description */}
            <div
              className="event-content mt-6"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />

            {/* CTA */}
            {!isPast && (
              <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="text-sm font-semibold text-text">Хотите попасть на мероприятие?</div>
                <div className="mt-1 text-xs text-muted">Оставьте заявку — мы свяжемся и расскажем подробности.</div>
                <Link
                  href="/#book"
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primaryText hover:opacity-90 transition"
                >
                  Записаться
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
