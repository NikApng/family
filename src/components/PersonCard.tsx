import Image from "next/image"
import Link from "next/link"
import type { BadgeTone } from "@/lib/badgeTones"

type Props = {
  name: string
  role: string
  exp: string
  badge: string
  tint: BadgeTone
  href: string
  imageUrl?: string | null
}

function safeText(v: unknown) {
  return String(v ?? "").trim()
}

function isValidImageUrl(value: string) {
  const v = safeText(value)
  if (!v) return false

  if (v.startsWith("/uploads/")) return true
  if (v.startsWith("/images/")) return true
  if (v.startsWith("http://")) return true
  if (v.startsWith("https://")) return true

  return false
}

function safeImageSrc(value: string | null | undefined) {
  const v = safeText(value)
  return isValidImageUrl(v) ? v : "/images/PersonPhoto.png"
}

export default function PersonCard({ name, role, exp, badge, tint, href, imageUrl }: Props) {
  const styles: Record<BadgeTone, { bg: string; glow: string; badge: string }> = {
    indigo: {
      bg: "from-white to-indigo-50/70 border-indigo-100 hover:border-indigo-200",
      glow: "bg-indigo-200/40",
      badge: "bg-indigo-100 text-indigo-700",
    },
    rose: {
      bg: "from-white to-rose-50/70 border-rose-100 hover:border-rose-200",
      glow: "bg-rose-200/45",
      badge: "bg-rose-100 text-rose-700",
    },
    amber: {
      bg: "from-white to-amber-50/70 border-amber-100 hover:border-amber-200",
      glow: "bg-amber-200/50",
      badge: "bg-amber-100 text-amber-800",
    },
    emerald: {
      bg: "from-white to-emerald-50/70 border-emerald-100 hover:border-emerald-200",
      glow: "bg-emerald-200/45",
      badge: "bg-emerald-100 text-emerald-700",
    },
    sky: {
      bg: "from-white to-sky-50/70 border-sky-100 hover:border-sky-200",
      glow: "bg-sky-200/45",
      badge: "bg-sky-100 text-sky-700",
    },
    violet: {
      bg: "from-white to-violet-50/70 border-violet-100 hover:border-violet-200",
      glow: "bg-violet-200/45",
      badge: "bg-violet-100 text-violet-700",
    },
    slate: {
      bg: "from-white to-slate-50/80 border-slate-200 hover:border-slate-300",
      glow: "bg-slate-200/55",
      badge: "bg-slate-100 text-slate-700",
    },
  }
  const tone = styles[tint]

  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden rounded-3xl border bg-gradient-to-b p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${tone.bg}`}
    >
      <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl ${tone.glow}`} />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone.badge}`}>{badge}</div>
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-indigo-100 bg-white">
            <Image src={safeImageSrc(imageUrl)} alt={name} fill sizes="56px" className="object-cover" />
          </div>
        </div>
        <div className="mt-4 text-xs font-medium text-gray-600">{role}</div>
        <div className="mt-1 text-xl font-semibold text-gray-900">{name}</div>
        <div className="mt-3 text-sm leading-relaxed text-gray-700">{exp}</div>
        <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700">
          Узнать больше <span className="transition group-hover:translate-x-0.5">→</span>
        </div>
      </div>
    </Link>
  )
}
