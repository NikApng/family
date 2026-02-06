import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

type Params = Promise<{ slug: string | string[] }>

function toSlug(value: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? ""
  return value ?? ""
}

function isValidImageUrl(value: string) {
  const v = String(value ?? "").trim()
  if (!v) return false

  return v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/uploads/") || v.startsWith("/images/")
}

function safeImageSrc(value: string | null) {
  const v = String(value ?? "").trim()
  return isValidImageUrl(v) ? v : "/images/PersonPhoto.png"
}

export default async function SpecialistPage({ params }: { params: Params }) {
  const { slug: rawSlug } = await params
  const slug = String(toSlug(rawSlug)).trim()

  if (!slug) notFound()

  const specialist = await prisma.specialist.findUnique({
    where: { slug },
  })

  if (!specialist || !specialist.isPublished) notFound()

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-16">
        <Link href="/#specialists" className="text-sm font-semibold text-indigo-700 hover:underline">
          ← К специалистам
        </Link>

        <div className="mt-6 rounded-3xl border border-indigo-100 bg-white p-8 shadow-sm">
          {specialist.imageUrl ? (
            <div className="mb-6 overflow-hidden rounded-2xl border border-indigo-100 bg-white">
              <div className="aspect-[16/9]">
                <img src={safeImageSrc(specialist.imageUrl)} alt={specialist.name} className="h-full w-full object-cover" />
              </div>
            </div>
          ) : null}

          <div className="text-sm text-gray-700">{specialist.role}</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">{specialist.name}</h1>

          <div className="mt-4 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            {specialist.badge}
          </div>

          <p className="mt-6 text-sm leading-relaxed text-gray-700">{specialist.bio}</p>

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
  )
}
