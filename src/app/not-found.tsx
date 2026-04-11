import Link from "next/link"

function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center justify-center rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow"
    >
      {children}
    </Link>
  )
}

function GhostLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center justify-center rounded-md border border-indigo-100 bg-white px-6 text-sm font-semibold text-gray-900 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:shadow"
    >
      {children}
    </Link>
  )
}

export default function NotFound() {
  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50 text-gray-900">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-indigo-300/18 blur-3xl" />
          <div className="absolute -right-32 top-8 h-[460px] w-[460px] rounded-full bg-rose-200/20 blur-3xl" />
          <div className="absolute left-1/2 top-56 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-amber-200/18 blur-3xl" />
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 py-16 md:py-24">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start">
            <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white p-8 shadow-sm md:p-10">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-200/30 blur-3xl" />

              <div className="relative">
                <div className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
                  Страница не найдена
                </div>

                <div className="mt-6 text-6xl font-semibold tracking-tight text-gray-900 md:text-7xl">404</div>

                <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
                  Похоже, такой страницы здесь нет
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-700 md:text-base">
                  Возможно, ссылка устарела, адрес был введён с ошибкой или нужная страница была перенесена. Вернитесь
                  на главную или откройте один из основных разделов сайта.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <PrimaryLink href="/">На главную</PrimaryLink>
                  <GhostLink href="/services">Услуги</GhostLink>
                  <GhostLink href="/contacts">Контакты</GhostLink>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      title: "Нужна помощь",
                      text: "Если вы искали поддержку, удобнее всего начать с раздела контактов.",
                    },
                    {
                      title: "Ищете ответы",
                      text: "В FAQ собраны короткие ответы на частые вопросы о работе организации.",
                    },
                    {
                      title: "Хотите вернуться",
                      text: "На главной странице доступны актуальные услуги, специалисты и мероприятия.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/60 p-4"
                    >
                      <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                      <div className="mt-2 text-xs leading-relaxed text-gray-700">{item.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
              <div className="text-lg font-semibold text-gray-900">Что можно сделать сейчас</div>
              <div className="mt-5 grid gap-3">
                {[
                  { href: "/faq", title: "Открыть FAQ", text: "Если нужен быстрый ответ без лишнего поиска." },
                  { href: "/services", title: "Посмотреть услуги", text: "Чтобы выбрать подходящий формат поддержки." },
                  { href: "/contacts", title: "Связаться с нами", text: "Если удобнее сразу перейти к прямым контактам." },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 transition hover:border-indigo-200 hover:bg-white"
                  >
                    <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                    <div className="mt-1 text-xs leading-relaxed text-gray-700">{item.text}</div>
                  </Link>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs leading-relaxed text-gray-700">
                Если ситуация срочная и вы чувствуете угрозу жизни или безопасности, обратитесь в экстренные службы
                вашего региона.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
