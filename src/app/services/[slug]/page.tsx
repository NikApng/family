import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Section } from "@/components/Section"
import { serviceDefaults, type ServiceBlock, type ServiceSlug } from "@/lib/services"

export const dynamic = "force-dynamic"

type Params = Promise<{ slug: string | string[] }>

function toSlug(value: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? ""
  return value ?? ""
}

function isServiceSlug(value: string): value is ServiceSlug {
  return value === "online" || value === "individual" || value === "group" || value === "relatives"
}

function toBlocks(value: unknown): ServiceBlock[] {
  if (!Array.isArray(value)) return []

  const blocks: ServiceBlock[] = []

  for (const item of value) {
    if (!item || typeof item !== "object") continue
    const title = String((item as any).title ?? "").trim()
    const text = String((item as any).text ?? "").trim()
    if (!title && !text) continue
    blocks.push({ title, text })
  }

  return blocks
}

export default async function ServicePage({ params }: { params: Params }) {
  const { slug: rawSlug } = await params
  const slug = String(toSlug(rawSlug)).trim()

  if (!slug) notFound()

  const service = await prisma.service.findUnique({
    where: { slug },
    select: { title: true, intro: true, blocks: true, isPublished: true },
  })

  if (service) {
    if (!service.isPublished) notFound()

    const data = {
      title: service.title,
      intro: service.intro,
      blocks: toBlocks(service.blocks),
    }

    return (
      <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <Link href="/services" className="text-sm font-semibold text-indigo-700 hover:underline">
            ← К услугам
          </Link>

          <div className="mt-6 rounded-3xl border border-indigo-100 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">{data.title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-700">{data.intro}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/#book"
                className="inline-flex h-11 items-center justify-center rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Записаться
              </Link>
              <Link
                href="/contacts"
                className="inline-flex h-11 items-center justify-center rounded-md border border-indigo-100 bg-white px-6 text-sm font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50"
              >
                Задать вопрос
              </Link>
            </div>
          </div>
        </div>

        <Section title="Подробности">
          <div className="grid gap-4 md:grid-cols-3">
            {data.blocks.map((b, idx) => (
              <div key={`${idx}-${b.title}`} className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
                <div className="font-semibold text-gray-900">{b.title}</div>
                <div className="mt-2 text-sm leading-relaxed text-gray-700">{b.text}</div>
              </div>
            ))}

            {!data.blocks.length ? (
              <div className="text-sm text-gray-600">Скоро добавим подробности об этой услуге.</div>
            ) : null}
          </div>
        </Section>
      </div>
    )
  }

  const total = await prisma.service.count()
  if (total === 0 && isServiceSlug(slug)) {
    const fallback = serviceDefaults[slug]

    return (
      <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <Link href="/services" className="text-sm font-semibold text-indigo-700 hover:underline">
            ← К услугам
          </Link>

          <div className="mt-6 rounded-3xl border border-indigo-100 bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">{fallback.title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-700">{fallback.intro}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/#book"
                className="inline-flex h-11 items-center justify-center rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Записаться
              </Link>
              <Link
                href="/contacts"
                className="inline-flex h-11 items-center justify-center rounded-md border border-indigo-100 bg-white px-6 text-sm font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50"
              >
                Задать вопрос
              </Link>
            </div>
          </div>
        </div>

        <Section title="Подробности">
          <div className="grid gap-4 md:grid-cols-3">
            {fallback.blocks.map((b, idx) => (
              <div key={`${idx}-${b.title}`} className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
                <div className="font-semibold text-gray-900">{b.title}</div>
                <div className="mt-2 text-sm leading-relaxed text-gray-700">{b.text}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    )
  }

  notFound()
}
