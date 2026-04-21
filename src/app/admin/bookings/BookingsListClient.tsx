"use client"

import { useEffect, useState } from "react"
import { deleteBookingAction, updateBookingStatusAction } from "./actions"

export type BookingStatus = "NEW" | "IN_PROGRESS" | "DONE" | "SPAM"

export type BookingListItem = {
  id: string
  name: string
  phone: string | null
  email: string | null
  message: string | null
  status: BookingStatus
  createdAtLabel: string
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  DONE: "Закрыта",
  SPAM: "Спам",
}

const STATUS_BADGE: Record<BookingStatus, string> = {
  NEW: "border-amber-100 bg-amber-50 text-amber-700",
  IN_PROGRESS: "border-indigo-100 bg-indigo-50 text-indigo-700",
  DONE: "border-emerald-100 bg-emerald-50 text-emerald-700",
  SPAM: "border-rose-100 bg-rose-50 text-rose-700",
}

function textOrFallback(value: string | null | undefined, fallback: string) {
  const text = String(value ?? "").trim()
  return text || fallback
}

function renderContact(value: string | null, hrefPrefix: "tel:" | "mailto:") {
  if (!value) return <span className="text-gray-500">-</span>

  return (
    <a
      href={`${hrefPrefix}${value}`}
      onClick={(event) => event.stopPropagation()}
      className="break-all text-gray-900 underline decoration-indigo-200 underline-offset-4 hover:text-indigo-700"
    >
      {value}
    </a>
  )
}

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold ${STATUS_BADGE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

function StatusUpdateForm({ id, status, fullWidth = false }: { id: string; status: BookingStatus; fullWidth?: boolean }) {
  return (
    <form
      action={updateBookingStatusAction}
      onClick={(event) => event.stopPropagation()}
      className={["flex items-center gap-2", fullWidth ? "w-full sm:w-auto" : ""].join(" ")}
    >
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        className="h-9 min-w-32 rounded-md border border-indigo-100 bg-white px-2 text-xs font-semibold text-gray-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
      >
        {(["NEW", "IN_PROGRESS", "DONE", "SPAM"] as const).map((value) => (
          <option key={value} value={value}>
            {STATUS_LABEL[value]}
          </option>
        ))}
      </select>
      <button className="inline-flex h-9 items-center justify-center rounded-md border border-indigo-100 bg-indigo-50 px-3 text-xs font-semibold text-indigo-700 transition hover:border-indigo-200 hover:bg-indigo-100">
        Сохранить
      </button>
    </form>
  )
}

function DeleteBookingForm({ id, fullWidth = false }: { id: string; fullWidth?: boolean }) {
  return (
    <form action={deleteBookingAction} onClick={(event) => event.stopPropagation()}>
      <input type="hidden" name="id" value={id} />
      <button
        className={[
          "inline-flex h-9 items-center justify-center rounded-md border border-rose-100 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition hover:border-rose-200 hover:bg-rose-100",
          fullWidth ? "w-full sm:w-auto" : "",
        ].join(" ")}
      >
        Удалить
      </button>
    </form>
  )
}

function BookingDetailsModal({
  item,
  onClose,
}: {
  item: BookingListItem
  onClose: () => void
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const message = textOrFallback(item.message, "Без комментария")

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-details-title"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-indigo-100 px-5 py-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Заявка</div>
            <h2 id="booking-details-title" className="mt-1 break-words text-xl font-semibold text-gray-900">
              {textOrFallback(item.name, "Без имени")}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span>{item.createdAtLabel}</span>
              <StatusBadge status={item.status} />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-indigo-100 text-xl leading-none text-gray-700 transition hover:border-indigo-200 hover:bg-indigo-50"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="max-h-[calc(88vh-84px)] overflow-y-auto px-5 py-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Телефон</div>
              <div className="mt-2 text-sm font-semibold">{renderContact(item.phone, "tel:")}</div>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Email</div>
              <div className="mt-2 text-sm font-semibold">{renderContact(item.email, "mailto:")}</div>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-indigo-100 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Полное сообщение</div>
            <div className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-900">{message}</div>
          </div>

          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <StatusUpdateForm id={item.id} status={item.status} />
            <DeleteBookingForm id={item.id} />
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 items-center justify-center rounded-md border border-indigo-100 px-3 text-xs font-semibold text-gray-900 transition hover:border-indigo-200 hover:bg-indigo-50"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BookingsListClient({ items }: { items: BookingListItem[] }) {
  const [selected, setSelected] = useState<BookingListItem | null>(null)

  function openItem(item: BookingListItem) {
    setSelected(item)
  }

  function handleRowKeyDown(event: React.KeyboardEvent<HTMLDivElement>, item: BookingListItem) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openItem(item)
    }
  }

  return (
    <>
      <div className="mt-6 overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <div className="hidden grid-cols-12 gap-3 border-b border-indigo-100 px-4 py-3 text-xs font-semibold text-gray-600 md:grid">
          <div className="col-span-2">Имя</div>
          <div className="col-span-2">Контакты</div>
          <div className="col-span-3">Сообщение</div>
          <div className="col-span-2">Дата</div>
          <div className="col-span-1">Статус</div>
          <div className="col-span-2 text-right">Действия</div>
        </div>

        {items.map((item) => {
          const message = textOrFallback(item.message, "Без комментария")

          return (
            <div key={item.id} className="border-b border-indigo-100 last:border-none">
              <div
                role="button"
                tabIndex={0}
                onClick={() => openItem(item)}
                onKeyDown={(event) => handleRowKeyDown(event, item)}
                className="px-4 py-4 outline-none transition hover:bg-indigo-50/40 focus-visible:bg-indigo-50/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-300 md:hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900">{textOrFallback(item.name, "Без имени")}</div>
                    <div className="mt-1 text-xs text-gray-600">{item.createdAtLabel}</div>
                  </div>
                  <StatusBadge status={item.status} />
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
                    <div className="mt-1 line-clamp-4 whitespace-pre-line break-words text-gray-800">{message}</div>
                    <div className="mt-2 text-xs font-semibold text-indigo-700">Открыть полностью</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusUpdateForm id={item.id} status={item.status} fullWidth />
                  <DeleteBookingForm id={item.id} fullWidth />
                </div>
              </div>

              <div
                role="button"
                tabIndex={0}
                onClick={() => openItem(item)}
                onKeyDown={(event) => handleRowKeyDown(event, item)}
                className="hidden grid-cols-12 gap-3 px-4 py-4 text-sm text-gray-800 outline-none transition hover:bg-indigo-50/40 focus-visible:bg-indigo-50/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-300 md:grid"
              >
                <div className="col-span-2 min-w-0">
                  <div className="truncate font-semibold text-gray-900">{textOrFallback(item.name, "Без имени")}</div>
                </div>

                <div className="col-span-2 space-y-2 text-sm">
                  <div>{renderContact(item.phone, "tel:")}</div>
                  <div>{renderContact(item.email, "mailto:")}</div>
                </div>

                <div className="col-span-3">
                  <div className="line-clamp-4 whitespace-pre-line break-words text-gray-800">{message}</div>
                  <div className="mt-2 text-xs font-semibold text-indigo-700">Открыть полностью</div>
                </div>

                <div className="col-span-2 text-xs text-gray-600">{item.createdAtLabel}</div>

                <div className="col-span-1">
                  <StatusBadge status={item.status} />
                </div>

                <div className="col-span-2 flex flex-wrap justify-end gap-2">
                  <StatusUpdateForm id={item.id} status={item.status} />
                  <DeleteBookingForm id={item.id} />
                </div>
              </div>
            </div>
          )
        })}

        {!items.length ? (
          <div className="px-4 py-10 text-center text-sm text-gray-600">По выбранным фильтрам заявок нет</div>
        ) : null}
      </div>

      {selected ? <BookingDetailsModal item={selected} onClose={() => setSelected(null)} /> : null}
    </>
  )
}
