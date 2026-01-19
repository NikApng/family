import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { photoSchema } from "@/lib/validators"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import UploadPhotoClient from "../UploadPhotoClient"

type Params = Promise<{ id: string | string[] }>

function toId(value: string | string[]) {
  if (Array.isArray(value)) return value[0] ?? ""
  return value ?? ""
}

async function ensureAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")
}

async function updatePhoto(id: string, formData: FormData) {
  "use server"
  await ensureAdmin()

  const raw = {
    title: String(formData.get("title") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? ""),
  }

  const parsed = photoSchema.safeParse(raw)
  if (!parsed.success) return

  await prisma.photoReport.update({
    where: { id },
    data: {
      title: parsed.data.title.trim(),
      imageUrl: parsed.data.imageUrl,

    },
  })

  revalidatePath("/gallery")
  revalidatePath("/admin/gallery")
  redirect("/admin/gallery")
}

async function deletePhoto(id: string) {
  "use server"
  await ensureAdmin()

  await prisma.photoReport.delete({ where: { id } })

  revalidatePath("/gallery")
  revalidatePath("/admin/gallery")
  redirect("/admin/gallery")
}

export default async function AdminGalleryEditPage({ params }: { params: Params }) {
  await ensureAdmin()

  const { id: rawId } = await params
  const id = String(toId(rawId)).trim()
  if (!id) redirect("/admin/gallery")

  const photo = await prisma.photoReport.findUnique({ where: { id } })
  if (!photo) redirect("/admin/gallery")

  const onUpdate = updatePhoto.bind(null, photo.id)
  const onDelete = deletePhoto.bind(null, photo.id)

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Редактировать фотоотчёт</h1>
          <div className="mt-1 text-sm text-gray-600">Обнови название и картинку.</div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/gallery"
            className="inline-flex h-10 items-center justify-center rounded-md border border-indigo-100 bg-white px-4 text-sm font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50"
          >
            Назад
          </Link>

          <form action={onDelete}>
            <button className="inline-flex h-10 items-center justify-center rounded-md border border-rose-100 bg-rose-50 px-4 text-sm font-semibold text-rose-700 hover:border-rose-200">
              Удалить
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-sm">
          <div className="relative aspect-[4/3]">
            <Image src={photo.imageUrl} alt={photo.title} fill className="object-cover" />
          </div>
          <div className="p-5">
            <div className="text-sm font-semibold text-gray-900">{photo.title}</div>
            <div className="mt-1 text-xs text-gray-500">
              {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(photo.createdAt)}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
          <div className="text-lg font-semibold text-gray-900">Данные</div>

          <UploadPhotoClient targetInputId="imageUrl" />

          <form action={onUpdate} className="mt-4 grid gap-3">
            <input
              name="title"
              defaultValue={photo.title}
              className="h-11 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300"
              required
            />
            <input
              name="imageUrl"
              id="imageUrl"
              defaultValue={photo.imageUrl}
              className="h-11 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300"
              required
            />
            <button className="h-11 rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700">
              Сохранить изменения
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
