import Link from "next/link"

type Props = {
  name: string
  role: string
  exp: string
  badge: string
  tint: "indigo" | "rose" | "amber"
  href: string
}

export default function PersonCard({ name, role, exp, badge, tint, href }: Props) {
  const bg =
    tint === "indigo"
      ? "from-white to-indigo-50/70 border-indigo-100 hover:border-indigo-200"
      : tint === "rose"
        ? "from-white to-rose-50/70 border-rose-100 hover:border-rose-200"
        : "from-white to-amber-50/70 border-amber-100 hover:border-amber-200"

  const glow =
    tint === "indigo"
      ? "bg-indigo-200/40"
      : tint === "rose"
        ? "bg-rose-200/45"
        : "bg-amber-200/50"

  const badgeBg =
    tint === "indigo"
      ? "bg-indigo-100 text-indigo-700"
      : tint === "rose"
        ? "bg-rose-100 text-rose-700"
        : "bg-amber-100 text-amber-800"

  return (
    <Link
      href={href}
      className={`group relative block overflow-hidden rounded-3xl border bg-gradient-to-b p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${bg}`}
    >
      <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl ${glow}`} />
      <div className="relative">
        <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeBg}`}>{badge}</div>
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
