import { prisma } from "@/lib/prisma"
import { BookingsListClient, type BookingListItem } from "./BookingsListClient"

export const dynamic = "force-dynamic"

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value)
}

export default async function AdminBookingsPage() {
  const items = await prisma.bookingRequest.findMany({
    orderBy: { createdAt: "desc" },
  })

  const bookingItems: BookingListItem[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    phone: item.phone,
    email: item.email,
    message: item.message,
    createdAtLabel: formatDate(item.createdAt),
  }))

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Заявки</h1>
          <p className="mt-1 text-sm text-gray-600">
            Все обращения из формы на сайте собираются здесь. Нажмите на заявку, чтобы открыть полную информацию.
          </p>
        </div>

        <div className="inline-flex h-10 items-center justify-center rounded-md border border-indigo-100 bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm">
          Всего: {items.length}
        </div>
      </div>

      <BookingsListClient items={bookingItems} />
    </div>
  )
}
