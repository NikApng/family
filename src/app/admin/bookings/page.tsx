import { prisma } from "@/lib/prisma"
import { deleteBookingAction } from "./actions"

export const dynamic = "force-dynamic"

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value)
}

function renderContact(value: string | null, hrefPrefix: "tel:" | "mailto:") {
  if (!value) return <span className="text-gray-500">-</span>

  return (
    <a
      href={`${hrefPrefix}${value}`}
      className="break-all text-gray-900 underline decoration-indigo-200 underline-offset-4 hover:text-indigo-700"
    >
      {value}
    </a>
  )
}

export default async function AdminBookingsPage() {
  const items = await prisma.bookingRequest.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Заявки</h1>
          <p className="mt-1 text-sm text-gray-600">
            Все обращения из формы на сайте собираются здесь. Новые заявки отображаются сверху.
          </p>
        </div>

        <div className="inline-flex h-10 items-center justify-center rounded-md border border-indigo-100 bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm">
          Всего: {items.length}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <div className="hidden grid-cols-12 gap-3 border-b border-indigo-100 px-4 py-3 text-xs font-semibold text-gray-600 md:grid">
          <div className="col-span-2">Имя</div>
          <div className="col-span-2">Контакты</div>
          <div className="col-span-4">Сообщение</div>
          <div className="col-span-2">Дата</div>
          <div className="col-span-2 text-right">Действия</div>
        </div>

        {items.map((item) => (
          <div key={item.id} className="border-b border-indigo-100 last:border-none">
            <div className="px-4 py-4 md:hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-gray-900">{item.name}</div>
                  <div className="mt-1 text-xs text-gray-600">{formatDate(item.createdAt)}</div>
                </div>
              </div>

              <div className="mt-3 grid gap-2 text-sm">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Телефон</div>
                  <div className="mt-1">{renderContact(item.phone, "tel:")}</div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</div>
                  <div className="mt-1">{renderContact(item.email, "mailto:")}</div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Сообщение</div>
                  <div className="mt-1 whitespace-pre-line break-words text-gray-800">
                    {item.message?.trim() || "Без комментария"}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <form action={deleteBookingAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="inline-flex h-9 w-full items-center justify-center rounded-md border border-rose-100 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:border-rose-200 sm:w-auto">
                    Удалить
                  </button>
                </form>
              </div>
            </div>

            <div className="hidden grid-cols-12 gap-3 px-4 py-4 text-sm text-gray-800 md:grid">
              <div className="col-span-2 min-w-0">
                <div className="truncate font-semibold text-gray-900">{item.name}</div>
              </div>

              <div className="col-span-2 space-y-2 text-sm">
                <div>{renderContact(item.phone, "tel:")}</div>
                <div>{renderContact(item.email, "mailto:")}</div>
              </div>

              <div className="col-span-4">
                <div className="line-clamp-4 whitespace-pre-line break-words text-gray-800">
                  {item.message?.trim() || "Без комментария"}
                </div>
              </div>

              <div className="col-span-2 text-xs text-gray-600">{formatDate(item.createdAt)}</div>

              <div className="col-span-2 flex justify-end">
                <form action={deleteBookingAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <button className="inline-flex h-9 items-center justify-center rounded-md border border-rose-100 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:border-rose-200">
                    Удалить
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}

        {!items.length ? (
          <div className="px-4 py-10 text-center text-sm text-gray-600">Пока нет ни одной заявки</div>
        ) : null}
      </div>
    </div>
  )
}
