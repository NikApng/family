import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

type Params = Promise<{ id: string | string[] }>

function toId(value: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? ""
  return value ?? ""
}

function isValidImageUrl(value: string) {
  const v = String(value ?? "").trim()
  if (!v) return false

  return v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/uploads/") || v.startsWith("/images/")
}

export default async function EventPage({ params }: { params: Params }) {
  const { id: rawId } = await params
  const id = String(toId(rawId)).trim()

  if (!id) notFound()

  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) notFound()

  const poster = isValidImageUrl(event.imageUrl ?? "") ? String(event.imageUrl) : ""

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-16">
        <Link href="/events" className="text-sm font-semibold text-indigo-700 hover:underline">
          ← К афише
        </Link>

        <div className="mt-6 overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm">
          {poster ? (
            <div className="aspect-[16/9] border-b border-indigo-100 bg-white">
              <img src={poster} alt={event.title} className="h-full w-full object-cover" />
            </div>
          ) : null}

          <div className="p-8">
            <div className="text-xs font-semibold text-gray-600">
              {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(event.date)}
              {event.place ? ` • ${event.place}` : ""}
            </div>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">{event.title}</h1>

            <p className="mt-6 text-sm leading-relaxed text-gray-700">{event.description}</p>

            <div className="mt-10 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
              <div className="text-sm font-semibold text-gray-900">Хотите записаться?</div>
              <div className="mt-1 text-xs text-gray-700">Оставьте заявку — мы свяжемся и подберём формат помощи.</div>

              <Link
                href="/#book"
                className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Обратиться
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
