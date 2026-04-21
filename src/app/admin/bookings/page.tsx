import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { BookingsListClient, type BookingListItem, type BookingStatus } from "./BookingsListClient"

export const dynamic = "force-dynamic"

type StatusFilter = "ALL" | BookingStatus
type SortOrder = "newest" | "oldest"

const STATUS_LABEL: Record<StatusFilter, string> = {
  ALL: "Все",
  NEW: "Новые",
  IN_PROGRESS: "В работе",
  DONE: "Закрытые",
  SPAM: "Спам",
}

const SORT_LABEL: Record<SortOrder, string> = {
  newest: "Сначала новые",
  oldest: "Сначала старые",
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value)
}

function normalizeStatus(value: unknown): StatusFilter {
  const status = String(value ?? "").toUpperCase()
  if (status === "ALL" || status === "NEW" || status === "IN_PROGRESS" || status === "DONE" || status === "SPAM") {
    return status
  }

  return "ALL"
}

function normalizeSort(value: unknown): SortOrder {
  return value === "oldest" ? "oldest" : "newest"
}

function bookingsHref(status: StatusFilter, sort: SortOrder) {
  const params = new URLSearchParams()
  if (status !== "ALL") params.set("status", status)
  if (sort !== "newest") params.set("sort", sort)

  const query = params.toString()
  return query ? `/admin/bookings?${query}` : "/admin/bookings"
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string
  active: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-semibold shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-300 ${
        active
          ? "border-indigo-200 bg-indigo-50 text-gray-900"
          : "border-indigo-100 bg-white text-gray-900 hover:border-indigo-200 hover:bg-indigo-50"
      }`}
    >
      {children}
    </Link>
  )
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; sort?: string }> | { status?: string; sort?: string }
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const status = normalizeStatus(resolvedSearchParams?.status)
  const sort = normalizeSort(resolvedSearchParams?.sort)
  const where = status === "ALL" ? undefined : { status }

  const [items, totalCount, filteredCount] = await Promise.all([
    prisma.bookingRequest.findMany({
      where,
      orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" },
    }),
    prisma.bookingRequest.count(),
    prisma.bookingRequest.count({ where }),
  ])

  const bookingItems: BookingListItem[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    phone: item.phone,
    email: item.email,
    message: item.message,
    status: item.status,
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
          Показано: {filteredCount} / {totalCount}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["ALL", "NEW", "IN_PROGRESS", "DONE", "SPAM"] as const).map((value) => (
          <FilterLink key={value} href={bookingsHref(value, sort)} active={status === value}>
            {STATUS_LABEL[value]}
          </FilterLink>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {(["newest", "oldest"] as const).map((value) => (
          <FilterLink key={value} href={bookingsHref(status, value)} active={sort === value}>
            {SORT_LABEL[value]}
          </FilterLink>
        ))}
      </div>

      <BookingsListClient items={bookingItems} />
    </div>
  )
}
