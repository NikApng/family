import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { approveReviewAction, deleteReviewAction, rejectReviewAction } from "./actions"

export const dynamic = "force-dynamic"

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED"
type ReviewStatusValue = Exclude<StatusFilter, "ALL">

const STATUS_LABEL: Record<StatusFilter, string> = {
  ALL: "Все",
  PENDING: "На модерации",
  APPROVED: "Подтверждённые",
  REJECTED: "Отклонённые",
}

const STATUS_BADGE: Record<Exclude<StatusFilter, "ALL">, string> = {
  PENDING: "border-amber-100 bg-amber-50 text-amber-700",
  APPROVED: "border-emerald-100 bg-emerald-50 text-emerald-700",
  REJECTED: "border-rose-100 bg-rose-50 text-rose-700",
}

const STATUS_VALUE_LABEL: Record<ReviewStatusValue, string> = {
  PENDING: "На модерации",
  APPROVED: "Подтверждён",
  REJECTED: "Отклонён",
}

function normalizeStatus(value: unknown): StatusFilter {
  const v = String(value ?? "").toUpperCase()
  if (v === "ALL" || v === "PENDING" || v === "APPROVED" || v === "REJECTED") return v
  return "PENDING"
}

function authorLabel(authorName: string | null, isAnonymous: boolean) {
  return isAnonymous || !authorName ? "Анонимно" : authorName
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams?: { status?: string }
}) {
  const status = normalizeStatus(searchParams?.status)

  const items = await prisma.review.findMany({
    where: status === "ALL" ? undefined : { status },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Отзывы</h1>
          <p className="mt-1 text-sm text-gray-600">Публичные отзывы появляются на сайте только после подтверждения.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((x) => (
          <Link
            key={x}
            href={x === "PENDING" ? "/admin/reviews" : `/admin/reviews?status=${x}`}
            className={`inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-semibold shadow-sm transition ${
              status === x
                ? "border-indigo-200 bg-indigo-50 text-gray-900"
                : "border-indigo-100 bg-white text-gray-900 hover:border-indigo-200 hover:bg-indigo-50"
            }`}
          >
            {STATUS_LABEL[x]}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <div className="hidden grid-cols-12 gap-3 border-b border-indigo-100 px-4 py-3 text-xs font-semibold text-gray-600 md:grid">
          <div className="col-span-2">Автор</div>
          <div className="col-span-4">Отзыв</div>
          <div className="col-span-1">Рейтинг</div>
          <div className="col-span-2">Дата</div>
          <div className="col-span-1">Статус</div>
          <div className="col-span-2 text-right">Действия</div>
        </div>

        {items.map((x) => (
          <div key={x.id} className="border-b border-indigo-100 last:border-none">
            <div className="px-4 py-4 md:hidden">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-gray-900">{authorLabel(x.authorName, x.isAnonymous)}</div>
                  <div className="mt-1 text-xs text-gray-600">
                    {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(x.createdAt)}
                    {x.rating ? ` • ${x.rating}/5` : ""}
                  </div>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center rounded-md border px-2 py-1 text-[11px] font-semibold ${
                    STATUS_BADGE[x.status]
                  }`}
                >
                  {STATUS_VALUE_LABEL[x.status]}
                </span>
              </div>

              <div className="mt-3 text-sm text-gray-800 line-clamp-4">{x.text}</div>

              <div className="mt-4 flex flex-wrap gap-2">
                {x.status === "PENDING" ? (
                  <>
                    <form action={approveReviewAction} className="w-full sm:w-auto">
                      <input type="hidden" name="id" value={x.id} />
                      <button className="inline-flex h-9 w-full items-center justify-center rounded-md border border-emerald-100 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 hover:border-emerald-200 sm:w-auto">
                        Подтвердить
                      </button>
                    </form>

                    <form action={rejectReviewAction} className="w-full sm:w-auto">
                      <input type="hidden" name="id" value={x.id} />
                      <button className="inline-flex h-9 w-full items-center justify-center rounded-md border border-amber-100 bg-amber-50 px-3 text-xs font-semibold text-amber-700 hover:border-amber-200 sm:w-auto">
                        Отклонить
                      </button>
                    </form>
                  </>
                ) : null}

                <form action={deleteReviewAction} className="w-full sm:w-auto">
                  <input type="hidden" name="id" value={x.id} />
                  <button className="inline-flex h-9 w-full items-center justify-center rounded-md border border-rose-100 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:border-rose-200 sm:w-auto">
                    Удалить
                  </button>
                </form>
              </div>
            </div>

            <div className="hidden grid-cols-12 gap-3 px-4 py-3 text-sm text-gray-800 md:grid">
              <div className="col-span-2 min-w-0">
                <div className="truncate font-semibold text-gray-900">{authorLabel(x.authorName, x.isAnonymous)}</div>
              </div>

              <div className="col-span-4 min-w-0">
                <div className="text-sm text-gray-800 line-clamp-3">{x.text}</div>
              </div>

              <div className="col-span-1">{x.rating ?? "—"}</div>

              <div className="col-span-2 text-xs text-gray-600">
                {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(x.createdAt)}
              </div>

              <div className="col-span-1">
                <span
                  className={`inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-semibold ${
                    STATUS_BADGE[x.status]
                  }`}
                >
                  {STATUS_VALUE_LABEL[x.status]}
                </span>
              </div>

              <div className="col-span-2 flex flex-wrap justify-end gap-2">
                {x.status === "PENDING" ? (
                  <>
                    <form action={approveReviewAction}>
                      <input type="hidden" name="id" value={x.id} />
                      <button className="inline-flex h-9 items-center justify-center rounded-md border border-emerald-100 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 hover:border-emerald-200">
                        Подтвердить
                      </button>
                    </form>

                    <form action={rejectReviewAction}>
                      <input type="hidden" name="id" value={x.id} />
                      <button className="inline-flex h-9 items-center justify-center rounded-md border border-amber-100 bg-amber-50 px-3 text-xs font-semibold text-amber-700 hover:border-amber-200">
                        Отклонить
                      </button>
                    </form>
                  </>
                ) : null}

                <form action={deleteReviewAction}>
                  <input type="hidden" name="id" value={x.id} />
                  <button className="inline-flex h-9 items-center justify-center rounded-md border border-rose-100 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:border-rose-200">
                    Удалить
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}

        {!items.length ? <div className="px-4 py-10 text-center text-sm text-gray-600">Пока пусто</div> : null}
      </div>
    </div>
  )
}
