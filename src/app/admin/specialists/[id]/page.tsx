import Link from "next/link"
import { revalidatePath } from "next/cache"
import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import UploadPhotoClient from "../../gallery/UploadPhotoClient"

type Params = Promise<{ id: string | string[] }>

function toId(value: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? ""
  return value ?? ""
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-|\-$/g, "")
}

function isValidImageUrl(value: string) {
  const v = String(value ?? "").trim()
  if (!v) return false

  return v.startsWith("http://") || v.startsWith("https://") || v.startsWith("/uploads/") || v.startsWith("/images/")
}

function normalizeImageUrl(value: unknown) {
  const v = String(value ?? "").trim()
  if (!v) return null
  return isValidImageUrl(v) ? v : null
}

async function updateSpecialist(id: string, formData: FormData) {
  "use server"

  const name = String(formData.get("name") ?? "").trim()
  const role = String(formData.get("role") ?? "").trim()
  const badge = String(formData.get("badge") ?? "").trim()
  const badgeTone = String(formData.get("badgeTone") ?? "indigo").trim()
  const excerpt = String(formData.get("excerpt") ?? "").trim()
  const bio = String(formData.get("bio") ?? "").trim()
  const imageUrl = normalizeImageUrl(formData.get("imageUrl"))
  const isPublished = String(formData.get("isPublished") ?? "") === "on"
  const sortOrder = Number(formData.get("sortOrder") ?? 0)

  const rawSlug = String(formData.get("slug") ?? "")
  const slug = normalizeSlug(rawSlug || name)

  if (!name || !role || !badge || !slug) return

  const existing = await prisma.specialist.findUnique({ where: { id }, select: { slug: true } })
  if (!existing) return

  const updated = await prisma.specialist.update({
    where: { id },
    data: {
      name,
      role,
      badge,
      badgeTone,
      excerpt,
      bio,
      slug,
      imageUrl,
      isPublished,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  })

  revalidatePath("/admin/specialists")
  revalidatePath("/")
  revalidatePath(`/specialists/${existing.slug}`)
  revalidatePath(`/specialists/${updated.slug}`)
  redirect("/admin/specialists")
}

export default async function AdminSpecialistEditPage({ params }: { params: Params }) {
  const { id: rawId } = await params
  const id = String(toId(rawId)).trim()

  if (!id) notFound()

  const specialist = await prisma.specialist.findUnique({ where: { id } })
  if (!specialist) notFound()

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Редактирование специалиста</h1>
          <p className="mt-1 text-sm text-gray-600">Обнови карточку и страницу специалиста.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/specialists/${specialist.slug}`}
            className="inline-flex h-10 items-center justify-center rounded-md border border-indigo-100 bg-white px-4 text-sm font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50"
          >
            Открыть на сайте
          </Link>

          <Link
            href="/admin/specialists"
            className="inline-flex h-10 items-center justify-center rounded-md border border-indigo-100 bg-white px-4 text-sm font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50"
          >
            Назад
          </Link>
        </div>
      </div>

      <form action={updateSpecialist.bind(null, id)} className="mt-6 grid gap-6">
        <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
          <UploadPhotoClient targetInputId="imageUrl" />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <div className="text-sm font-semibold text-gray-900">Имя</div>
              <input
                name="name"
                defaultValue={specialist.name}
                className="h-11 rounded-md border border-indigo-100 px-3 text-sm outline-none focus:border-indigo-300"
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-semibold text-gray-900">Роль</div>
              <input
                name="role"
                defaultValue={specialist.role}
                className="h-11 rounded-md border border-indigo-100 px-3 text-sm outline-none focus:border-indigo-300"
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-semibold text-gray-900">Адрес страницы</div>
              <input
                name="slug"
                defaultValue={specialist.slug}
                className="h-11 rounded-md border border-indigo-100 px-3 text-sm outline-none focus:border-indigo-300"
                placeholder="anna-p"
              />
              <div className="text-xs text-gray-500">
                Будет в URL: /specialists/… (латиница/цифры). Если пусто — сделаем из имени.
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-semibold text-gray-900">Сортировка</div>
              <input
                name="sortOrder"
                type="number"
                defaultValue={specialist.sortOrder ?? 0}
                className="h-11 rounded-md border border-indigo-100 px-3 text-sm outline-none focus:border-indigo-300"
              />
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-semibold text-gray-900">Бейдж</div>
              <input
                name="badge"
                defaultValue={specialist.badge}
                className="h-11 rounded-md border border-indigo-100 px-3 text-sm outline-none focus:border-indigo-300"
                required
              />
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-semibold text-gray-900">Цвет бейджа</div>
              <select
                name="badgeTone"
                defaultValue={specialist.badgeTone || "indigo"}
                className="h-11 rounded-md border border-indigo-100 px-3 text-sm outline-none focus:border-indigo-300"
              >
                <option value="indigo">indigo</option>
                <option value="rose">rose</option>
                <option value="amber">amber</option>
              </select>
            </div>

            <div className="grid gap-2 md:col-span-2">
              <div className="text-sm font-semibold text-gray-900">Фото (URL)</div>
              <input
                id="imageUrl"
                name="imageUrl"
                defaultValue={specialist.imageUrl ?? ""}
                placeholder="https://… или /uploads/… или /images/…"
                className="h-11 rounded-md border border-indigo-100 px-3 text-sm outline-none focus:border-indigo-300"
              />
              <div className="text-xs text-gray-500">Можно загрузить файл выше или вставить ссылку.</div>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <div className="text-sm font-semibold text-gray-900">Короткое описание (на карточке)</div>
            <textarea
              name="excerpt"
              defaultValue={specialist.excerpt}
              className="min-h-24 rounded-md border border-indigo-100 px-3 py-3 text-sm outline-none focus:border-indigo-300"
              required
            />
          </div>

          <div className="mt-4 grid gap-2">
            <div className="text-sm font-semibold text-gray-900">Полное описание (на странице специалиста)</div>
            <textarea
              name="bio"
              defaultValue={specialist.bio}
              className="min-h-40 rounded-md border border-indigo-100 px-3 py-3 text-sm outline-none focus:border-indigo-300"
              required
            />
          </div>

          <label className="mt-4 inline-flex items-center gap-2 text-sm text-gray-900">
            <input name="isPublished" type="checkbox" className="h-4 w-4" defaultChecked={specialist.isPublished} />
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
