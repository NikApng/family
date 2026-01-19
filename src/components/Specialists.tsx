import Link from "next/link"
import { prisma } from "@/lib/prisma"

type Tone = "indigo" | "rose" | "amber"

const toneStyles: Record<
  Tone,
  { card: string; badge: string; border: string }
> = {
  indigo: {
    card: "bg-gradient-to-b from-indigo-50 to-white",
    badge: "bg-indigo-100 text-indigo-700",
    border: "border-indigo-100 hover:border-indigo-200",
  },
  rose: {
    card: "bg-gradient-to-b from-rose-50 to-white",
    badge: "bg-rose-100 text-rose-700",
    border: "border-rose-100 hover:border-rose-200",
  },
  amber: {
    card: "bg-gradient-to-b from-amber-50 to-white",
    badge: "bg-amber-100 text-amber-800",
    border: "border-amber-100 hover:border-amber-200",
  },
}

function safeTone(value: string): Tone {
  if (value === "rose" || value === "amber" || value === "indigo") return value
  return "indigo"
}

export default async function SpecialistsSection() {
  const specialists = await prisma.specialist.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 3,
  })

  if (specialists.length === 0) return null

  return (
    <section id="specialists" className="py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
          Наши специалисты
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
          Психологи и волонтёры с опытом кризисной помощи.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {specialists.map((s) => {
            const tone = safeTone(s.badgeTone)
            const styles = toneStyles[tone]

            return (
              <div
                key={s.id}
                className={[
                  "rounded-3xl border p-8 shadow-sm transition",
                  styles.card,
                  styles.border,
                  "hover:shadow-md",
                ].join(" ")}
              >
                <div
                  className={[
                    "inline-flex h-8 items-center rounded-full px-4 text-xs font-semibold",
                    styles.badge,
                  ].join(" ")}
                >
                  {s.badge}
                </div>

                <div className="mt-6 text-sm text-gray-700">{s.role}</div>
                <div className="mt-2 text-2xl font-semibold text-gray-900">
                  {s.name}
                </div>

                <p className="mt-4 text-sm leading-relaxed text-gray-700">
                  {s.excerpt}
                </p>

                <Link
                  href={`/specialists/${s.slug}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-800"
                >
                  Узнать больше <span aria-hidden>→</span>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
