import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

async function togglePublish(formData: FormData) {
  "use server"

  const id = String(formData.get("id") ?? "")
  if (!id) return

  const current = await prisma.specialist.findUnique({ where: { id } })
  if (!current) return

  await prisma.specialist.update({
    where: { id },
    data: { isPublished: !current.isPublished },
  })

  revalidatePath("/admin/specialists")
  revalidatePath("/")
  revalidatePath(`/specialists/${current.slug}`)
}

async function removeSpecialist(formData: FormData) {
  "use server"

  const id = String(formData.get("id") ?? "")
  if (!id) return

  const existing = await prisma.specialist.findUnique({ where: { id }, select: { slug: true } })
  if (!existing) return

  await prisma.specialist.delete({ where: { id } })

  revalidatePath("/admin/specialists")
  revalidatePath("/")
  revalidatePath(`/specialists/${existing.slug}`)
}

export default async function AdminSpecialistsPage() {
  const items = await prisma.specialist.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  })

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Специалисты</h1>
          <p className="mt-1 text-sm text-gray-600">Список специалистов на главной и их страницы.</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/specialists/new"
            className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Добавить специалиста
          </Link>
        </div>
      </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm">
        <div className="hidden grid-cols-12 gap-3 border-b border-indigo-100 px-4 py-3 text-xs font-semibold text-gray-600 md:grid">
          <div className="col-span-4">Имя</div>
          <div className="col-span-3">Роль</div>
          <div className="col-span-2">Ссылка</div>
          <div className="col-span-1">Публ.</div>
          <div className="col-span-2 text-right">Действия</div>
        </div>

        {items.map((x) => (
          <div key={x.id} className="border-b border-indigo-100 last:border-none">
            <div className="px-4 py-4 md:hidden">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-gray-900">
                    <Link href={`/specialists/${x.slug}`} className="hover:underline">
                      {x.name}
                    </Link>
                  </div>
                  <div className="mt-1 text-xs text-gray-600">{x.role}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    /specialists/{x.slug} • {x.isPublished ? "Опубликован" : "Скрыт"}
                  </div>
                </div>

                <span
                  className={`inline-flex shrink-0 items-center rounded-md border px-2 py-1 text-[11px] font-semibold ${
                    x.isPublished
                      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                      : "border-amber-100 bg-amber-50 text-amber-700"
                  }`}
                >
                  {x.isPublished ? "Да" : "Нет"}
                </span>
              </div>

              {x.badge ? <div className="mt-3 text-xs text-gray-500">{x.badge}</div> : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/admin/specialists/${x.id}`}
                  className="inline-flex h-9 w-full items-center justify-center rounded-md border border-indigo-100 bg-white px-3 text-xs font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50 sm:w-auto"
                >
                  Редактировать
                </Link>

                <form action={togglePublish} className="w-full sm:w-auto">
                  <input type="hidden" name="id" value={x.id} />
                  <button className="inline-flex h-9 w-full items-center justify-center rounded-md border border-indigo-100 bg-white px-3 text-xs font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50 sm:w-auto">
                    {x.isPublished ? "Снять" : "Опубликовать"}
                  </button>
                </form>

                <form action={removeSpecialist} className="w-full sm:w-auto">
                  <input type="hidden" name="id" value={x.id} />
                  <button className="inline-flex h-9 w-full items-center justify-center rounded-md border border-rose-100 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:border-rose-200 sm:w-auto">
                    Удалить
                  </button>
                </form>
              </div>
            </div>

            <div className="hidden grid-cols-12 gap-3 px-4 py-3 text-sm text-gray-800 md:grid">
              <div className="col-span-4 font-semibold text-gray-900">
                <Link href={`/specialists/${x.slug}`} className="hover:underline">
                  {x.name}
                </Link>
                <div className="mt-1 text-xs text-gray-500">{x.badge}</div>
              </div>

              <div className="col-span-3">{x.role}</div>
              <div className="col-span-2 truncate text-gray-600">
                <Link href={`/specialists/${x.slug}`} className="hover:underline">
                  /specialists/{x.slug}
                </Link>
              </div>
              <div className="col-span-1">{x.isPublished ? "Да" : "Нет"}</div>

              <div className="col-span-2 flex flex-wrap justify-end gap-2">
                <Link
                  href={`/admin/specialists/${x.id}`}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-indigo-100 bg-white px-3 text-xs font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50"
                >
                  Редактировать
                </Link>

                <form action={togglePublish}>
                  <input type="hidden" name="id" value={x.id} />
                  <button className="inline-flex h-9 items-center justify-center rounded-md border border-indigo-100 bg-white px-3 text-xs font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50">
                    {x.isPublished ? "Снять" : "Опубликовать"}
                  </button>
                </form>

                <form action={removeSpecialist}>
                  <input type="hidden" name="id" value={x.id} />
                  <button className="inline-flex h-9 items-center justify-center rounded-md border border-rose-100 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:border-rose-200">
                    Удалить
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}

        {!items.length ? (
          <div className="px-4 py-10 text-center text-sm text-gray-600">Пока пусто</div>
        ) : null}
      </div>
    </div>
  )
}
