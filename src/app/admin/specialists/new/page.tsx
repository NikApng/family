import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-|\-$/g, "")
}

async function createSpecialist(formData: FormData) {
  "use server"

  const name = String(formData.get("name") ?? "").trim()
  const role = String(formData.get("role") ?? "").trim()
  const badge = String(formData.get("badge") ?? "").trim()
  const badgeTone = String(formData.get("badgeTone") ?? "indigo").trim()
  const excerpt = String(formData.get("excerpt") ?? "").trim()
  const bio = String(formData.get("bio") ?? "").trim()
  const isPublished = String(formData.get("isPublished") ?? "") === "on"
  const sortOrder = Number(formData.get("sortOrder") ?? 0)

  const rawSlug = String(formData.get("slug") ?? "")
  const slug = normalizeSlug(rawSlug || name)

  if (!name || !role || !badge || !slug) return

  await prisma.specialist.create({
    data: {
      name,
      role,
      badge,
      badgeTone,
      excerpt,
      bio,
      slug,
      isPublished,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  })

  revalidatePath("/admin/specialists")
  revalidatePath("/")
  redirect("/admin/specialists")
}

export default function AdminSpecialistsNewPage() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Новый специалист</h1>
          <p className="mt-1 text-sm text-gray-600">Создай карточку и страницу специалиста.</p>
        </div>

        <Link
          href="/admin/specialists"
          className="inline-flex h-10 items-center justify-center rounded-md border border-indigo-100 bg-white px-4 text-sm font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50"
        >
          Назад
        </Link>
      </div>

      <form action={createSpecialist} className="mt-6 grid gap-6">
        <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <div className="text-sm font-semibold text-gray-900">Имя</div>
              <input
                name="name"
                className="h-11 rounded-md border border-indigo-100 px-3 text-sm outline-none focus:border-indigo-300"
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-semibold text-gray-900">Роль</div>
              <input
                name="role"
                className="h-11 rounded-md border border-indigo-100 px-3 text-sm outline-none focus:border-indigo-300"
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-semibold text-gray-900">Slug</div>
              <input
                name="slug"
                className="h-11 rounded-md border border-indigo-100 px-3 text-sm outline-none focus:border-indigo-300"
                placeholder="anna-p"
              />
              <div className="text-xs text-gray-500">Если пусто — сделаем из имени.</div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-semibold text-gray-900">Сортировка</div>
              <input
                name="sortOrder"
                type="number"
                defaultValue={0}
                className="h-11 rounded-md border border-indigo-100 px-3 text-sm outline-none focus:border-indigo-300"
              />
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-semibold text-gray-900">Бейдж</div>
              <input
                name="badge"
                className="h-11 rounded-md border border-indigo-100 px-3 text-sm outline-none focus:border-indigo-300"
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-semibold text-gray-900">Цвет бейджа</div>
              <select
                name="badgeTone"
                defaultValue="indigo"
                className="h-11 rounded-md border border-indigo-100 px-3 text-sm outline-none focus:border-indigo-300"
              >
                <option value="indigo">indigo</option>
                <option value="rose">rose</option>
                <option value="amber">amber</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <div className="text-sm font-semibold text-gray-900">Короткое описание (на карточке)</div>
            <textarea
              name="excerpt"
              className="min-h-24 rounded-md border border-indigo-100 px-3 py-3 text-sm outline-none focus:border-indigo-300"
              required
            />
          </div>

          <div className="mt-4 grid gap-2">
            <div className="text-sm font-semibold text-gray-900">Полное описание (на странице специалиста)</div>
            <textarea
              name="bio"
              className="min-h-40 rounded-md border border-indigo-100 px-3 py-3 text-sm outline-none focus:border-indigo-300"
              required
            />
          </div>

          <label className="mt-4 inline-flex items-center gap-2 text-sm text-gray-900">
            <input name="isPublished" type="checkbox" className="h-4 w-4" />
            Опубликовать
          </label>

          <div className="mt-6 flex flex-wrap gap-2">
            <button className="inline-flex h-11 items-center justify-center rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700">
              Сохранить
            </button>
            <Link
              href="/admin/specialists"
              className="inline-flex h-11 items-center justify-center rounded-md border border-indigo-100 bg-white px-6 text-sm font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50"
            >
              Отмена
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
