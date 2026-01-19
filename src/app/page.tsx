import Image from "next/image"
import Link from "next/link"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { bookingSchema } from "@/lib/validators"
import { Section } from "@/components/Section"
import PersonCard from "@/components/PersonCard"

async function createBooking(formData: FormData) {
  "use server"

  const raw = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  }

  const parsed = bookingSchema.safeParse(raw)
  if (!parsed.success) return

  await prisma.bookingRequest.create({ data: parsed.data })
  revalidatePath("/")
}

type UiLinkProps = {
  href: string
  children: React.ReactNode
}

function PrimaryLink({ href, children }: UiLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center justify-center rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow"
    >
      {children}
    </Link>
  )
}

function GhostLink({ href, children }: UiLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center justify-center rounded-md border border-indigo-100 bg-white px-6 text-sm font-semibold text-gray-900 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:shadow"
    >
      {children}
    </Link>
  )
}

type InfoCardProps = {
  title: string
  description: string
  accent: "indigo" | "rose" | "amber"
}

function InfoCard({ title, description, accent }: InfoCardProps) {
  const accentBg =
    accent === "indigo"
      ? "from-white to-indigo-50/70 border-indigo-100 hover:border-indigo-200"
      : accent === "rose"
        ? "from-white to-rose-50/70 border-rose-100 hover:border-rose-200"
        : "from-white to-amber-50/70 border-amber-100 hover:border-amber-200"

  const dot =
    accent === "indigo"
      ? "bg-indigo-200/50"
      : accent === "rose"
        ? "bg-rose-200/50"
        : "bg-amber-200/60"

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border bg-gradient-to-b p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${accentBg}`}
    >
      <div className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl ${dot}`} />
      <div className="relative">
        <div className="text-base font-semibold text-gray-900">{title}</div>
        <div className="mt-2 text-sm leading-relaxed text-gray-700">{description}</div>
      </div>
    </div>
  )
}

type TestimonialProps = {
  text: string
  author: string
  tint: "rose" | "indigo" | "amber"
}

function TestimonialCard({ text, author, tint }: TestimonialProps) {
  const bg =
    tint === "rose"
      ? "from-white to-rose-50/70 border-rose-100 hover:border-rose-200"
      : tint === "indigo"
        ? "from-white to-indigo-50/70 border-indigo-100 hover:border-indigo-200"
        : "from-white to-amber-50/70 border-amber-100 hover:border-amber-200"

  const glow =
    tint === "rose"
      ? "bg-rose-200/40"
      : tint === "indigo"
        ? "bg-indigo-200/40"
        : "bg-amber-200/50"

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border bg-gradient-to-b p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${bg}`}
    >
      <div className={`pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full blur-2xl ${glow}`} />
      <div className="relative">
        <div className="text-sm leading-relaxed text-gray-800">“{text}”</div>
        <div className="mt-5 text-xs font-semibold text-gray-600">{author}</div>
      </div>
    </div>
  )
}

type BackdropProps = {
  id?: string
  children: React.ReactNode
  variant?: "a" | "b" | "c" | "d"
}

function BackdropSection({ id, children, variant = "a" }: BackdropProps) {
  const base = "relative overflow-hidden"
  const bg =
    variant === "a"
      ? {
          left: "bg-indigo-300/16",
          right: "bg-rose-200/20",
          third: "bg-amber-200/18",
          leftPos: "-left-40 top-8 h-[520px] w-[520px]",
          rightPos: "-right-52 top-24 h-[620px] w-[620px]",
          thirdPos: "left-1/2 -bottom-64 h-[560px] w-[560px] -translate-x-1/2",
        }
      : variant === "b"
        ? {
            left: "bg-rose-200/20",
            right: "bg-indigo-300/16",
            third: "bg-amber-200/16",
            leftPos: "-left-52 -top-28 h-[620px] w-[620px]",
            rightPos: "-right-48 -top-10 h-[520px] w-[520px]",
            thirdPos: "left-1/3 -bottom-72 h-[560px] w-[560px]",
          }
        : variant === "c"
          ? {
              left: "bg-amber-200/18",
              right: "bg-rose-200/18",
              third: "bg-indigo-300/14",
              leftPos: "-left-48 top-16 h-[560px] w-[560px]",
              rightPos: "-right-56 top-44 h-[680px] w-[680px]",
              thirdPos: "right-1/3 -bottom-80 h-[520px] w-[520px]",
            }
          : {
              left: "bg-indigo-300/14",
              right: "bg-amber-200/18",
              third: "bg-rose-200/16",
              leftPos: "-left-56 -top-20 h-[680px] w-[680px]",
              rightPos: "-right-40 -top-6 h-[520px] w-[520px]",
              thirdPos: "left-2/3 -bottom-72 h-[560px] w-[560px]",
            }

  return (
    <section id={id} className={`${base} scroll-mt-24`}>
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className={`absolute rounded-full blur-3xl ${bg.left} ${bg.leftPos}`} />
        <div className={`absolute rounded-full blur-3xl ${bg.right} ${bg.rightPos}`} />
        <div className={`absolute rounded-full blur-3xl ${bg.third} ${bg.thirdPos}`} />
      </div>
      {children}
    </section>
  )
}

function toTint(value: string): "indigo" | "rose" | "amber" {
  if (value === "rose" || value === "amber" || value === "indigo") return value
  return "indigo"
}

export default async function HomePage() {
  const upcoming = await prisma.event.findMany({
    orderBy: { date: "asc" },
    take: 3,
    where: { date: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
  })

  const specialists = await prisma.specialist.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  })

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50 text-gray-900">
      <section className="relative overflow-hidden border-b border-indigo-100">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-indigo-300/25 blur-3xl" />
          <div className="absolute -bottom-56 left-12 h-[520px] w-[520px] rounded-full bg-rose-200/35 blur-3xl" />
          <div className="absolute -bottom-64 right-10 h-[520px] w-[520px] rounded-full bg-amber-200/30 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 py-14 md:py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
                Про Семью, Про Единство
              </div>

              <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
                Вы не одни.
                <br />
                Мы рядом, чтобы поддержать вас.
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-700">
                Психологическая поддержка для вас.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <PrimaryLink href="#book">Обратитесь к нам прямо сейчас</PrimaryLink>
                <GhostLink href="#what">Что мы делаем</GhostLink>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { t: "Конфиденциально", d: "Данные под защитой, без лишних вопросов." },
                  { t: "Бережно", d: "Без давления, с уважением к вашему опыту." },
                  { t: "Понятно", d: "Простые шаги, без сложных терминов." },
                ].map((x) => (
                  <div
                    key={x.t}
                    className="rounded-2xl border border-indigo-100 bg-white/80 p-4 shadow-sm transition hover:border-indigo-200"
                  >
                    <div className="text-sm font-semibold">{x.t}</div>
                    <div className="mt-1 text-xs leading-relaxed text-gray-700">{x.d}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white/70 shadow-sm backdrop-blur">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/60 via-white to-rose-50/50" />

              <div className="relative p-4 md:p-5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-indigo-100 bg-white">
                  <Image
                    src="/images/PersonPhoto.png"
                    alt="Семья рядом друг с другом"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {[
                    { t: "Онлайн", d: "Консультации из любого региона" },
                    { t: "Группы", d: "Поддержка с теми, кто понимает" },
                    { t: "Близким", d: "Рекомендации и ответы на вопросы" },
                  ].map((x) => (
                    <div
                      key={x.t}
                      className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm transition hover:border-indigo-200"
                    >
                      <div className="text-sm font-semibold text-gray-900">{x.t}</div>
                      <div className="mt-1 text-xs leading-relaxed text-gray-700">{x.d}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs leading-relaxed text-gray-700">
                  Если вы чувствуете, что вам небезопасно или есть риск для жизни — обратитесь в экстренные службы вашего
                  региона.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BackdropSection id="what" variant="a">
        <Section title="Что мы делаем" subtitle="Основные направления поддержки — просто и по делу.">
          <div className="grid gap-6 md:grid-cols-3">
            <InfoCard
              accent="indigo"
              title="Консультации психологов"
              description="Индивидуальная поддержка онлайн или в другом удобном формате. Помогаем снизить тревогу, вернуть опору и ясность."
            />
            <InfoCard
              accent="rose"
              title="Группы поддержки и терапии"
              description="Встречи, где можно быть услышанным и не оставаться один на один с переживаниями. Тёплая среда и понятные правила."
            />
            <InfoCard
              accent="amber"
              title="Информационные ресурсы и помощь близким"
              description="Рекомендации для родных и друзей, ответы на частые вопросы, аккуратные материалы о том, как поддерживать и не выгорать."
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <GhostLink href="/services/online">Онлайн-консультация</GhostLink>
            <GhostLink href="/services/individual">Индивидуальная терапия</GhostLink>
            <GhostLink href="/services/group">Группа взаимопомощи</GhostLink>
            <GhostLink href="/services/relatives">Поддержка близких</GhostLink>
          </div>
        </Section>
      </BackdropSection>

      <BackdropSection id="specialists" variant="b">
        <Section title="Наши специалисты" subtitle="Психологи и волонтёры с опытом кризисной помощи.">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {specialists.map((s) => (
              <PersonCard
                key={s.id}
                name={s.name}
                role={s.role}
                exp={s.excerpt}
                badge={s.badge}
                tint={toTint(s.badgeTone)}
                href={`/specialists/${s.slug}`}
              />
            ))}
          </div>

          {!specialists.length ? (
            <div className="mt-6 rounded-3xl border border-indigo-100 bg-white p-7 text-sm text-gray-700 shadow-sm">
              Скоро добавим специалистов.
            </div>
          ) : null}
        </Section>
      </BackdropSection>

      <BackdropSection id="reviews" variant="c">
        <Section title="Отзывы клиентов" subtitle="Реальные истории благодарности — можно публиковать анонимно.">
          <div className="grid gap-6 md:grid-cols-3">
            <TestimonialCard tint="rose" text="Спасибо за поддержку и спокойный разговор. Стало легче дышать." author="Анонимно" />
            <TestimonialCard tint="indigo" text="После встреч появилась опора и понимание, что делать дальше." author="Елена" />
            <TestimonialCard tint="amber" text="Очень бережный подход. Без давления и лишних вопросов." author="Анонимно" />
          </div>
        </Section>
      </BackdropSection>

      <BackdropSection id="events" variant="d">
        <Section title="Ближайшие мероприятия" subtitle="Актуальные встречи и события.">
          <div className="grid gap-6 md:grid-cols-3">
            {upcoming.map((e) => (
              <div
                key={e.id}
                className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/60 p-7 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-200/40 blur-2xl" />
                <div className="relative">
                  <div className="text-xs font-semibold text-gray-600">
                    {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(e.date)}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-gray-900">{e.title}</div>
                  <div className="mt-2 text-sm leading-relaxed text-gray-700 line-clamp-3">{e.description}</div>
                  <div className="mt-5">
                    <Link href="/events" className="text-sm font-semibold text-indigo-700 hover:underline">
                      Смотреть афишу →
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            {!upcoming.length ? (
              <div className="rounded-3xl border border-indigo-100 bg-white p-7 text-sm text-gray-700 shadow-sm">
                Скоро добавим ближайшие события.
              </div>
            ) : null}
          </div>
        </Section>
      </BackdropSection>

      <BackdropSection id="book" variant="a">
        <Section title="Обратиться за поддержкой" subtitle="Оставьте заявку — мы свяжемся с вами и подберём удобный формат.">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <form action={createBooking} className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    name="name"
                    placeholder="Имя"
                    className="h-11 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                  <input
                    name="phone"
                    placeholder="Телефон"
                    className="h-11 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    required
                  />
                </div>

                <input
                  name="email"
                  placeholder="Email (необязательно)"
                  className="h-11 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />

                <textarea
                  name="message"
                  placeholder="Коротко опишите ситуацию (необязательно)"
                  className="min-h-32 rounded-md border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />

                <button className="h-11 rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow">
                  Отправить заявку
                </button>

                <div className="text-xs leading-relaxed text-gray-600">
                  Мы бережно относимся к вашим данным. Можно обращаться анонимно.
                </div>
              </div>
            </form>

            <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
              <div className="text-base font-semibold text-gray-900">Как всё проходит</div>
              <div className="mt-2 text-sm leading-relaxed text-gray-700">
                Мы ответим, уточним удобный способ связи и предложим варианты помощи — без давления и спешки.
              </div>

              <div className="mt-6 grid gap-3">
                {[
                  { t: "1) Контакт", d: "Свяжемся по телефону или email — как вам удобнее." },
                  { t: "2) Подбор", d: "Подберём специалиста или формат поддержки." },
                  { t: "3) Поддержка", d: "Начнём с короткой встречи и бережного плана." },
                ].map((x) => (
                  <div key={x.t} className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                    <div className="text-sm font-semibold text-gray-900">{x.t}</div>
                    <div className="mt-1 text-xs leading-relaxed text-gray-700">{x.d}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs leading-relaxed text-gray-700">
                Если вам тяжело прямо сейчас — короткое сообщение тоже подойдёт. Можно без подробностей.
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <GhostLink href="/contacts">Контакты</GhostLink>
                <GhostLink href="/faq">FAQ</GhostLink>
              </div>
            </div>
          </div>
        </Section>
      </BackdropSection>

      <section className="relative overflow-hidden border-t border-indigo-100">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-56 -top-20 h-[680px] w-[680px] rounded-full bg-rose-200/18 blur-3xl" />
          <div className="absolute -right-48 -top-10 h-[620px] w-[620px] rounded-full bg-indigo-300/14 blur-3xl" />
          <div className="absolute left-1/2 -bottom-72 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-amber-200/18 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-14">
          <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white p-8 shadow-sm md:flex md:items-center md:justify-between">
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-indigo-300/25 blur-2xl" />
            <div className="relative">
              <div className="text-2xl font-semibold tracking-tight text-gray-900">
                Поддержка рядом. Сделайте первый шаг.
              </div>
              <div className="mt-2 text-sm leading-relaxed text-gray-700">Запрос — это уже движение к облегчению.</div>
            </div>

            <div className="relative mt-6 md:mt-0">
              <PrimaryLink href="#book">Обратиться сейчас</PrimaryLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
