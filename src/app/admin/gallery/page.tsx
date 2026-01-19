import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { photoSchema } from "@/lib/validators"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import UploadPhotoClient from "./UploadPhotoClient"

async function ensureAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")
}

async function createPhoto(formData: FormData) {
  "use server"
  await ensureAdmin()

  const raw = {
    title: String(formData.get("title") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? ""),
  }

  const parsed = photoSchema.safeParse(raw)
  if (!parsed.success) return

  await prisma.photoReport.create({
    data: {
      title: parsed.data.title.trim(),
      imageUrl: parsed.data.imageUrl,

    },
  })

  revalidatePath("/gallery")
  revalidatePath("/admin/gallery")
}

async function deletePhoto(formData: FormData) {
  "use server"
  await ensureAdmin()

  const id = String(formData.get("id") ?? "")
  if (!id) return

  await prisma.photoReport.delete({ where: { id } })

  revalidatePath("/gallery")
  revalidatePath("/admin/gallery")
}

export default async function AdminGalleryPage() {
  await ensureAdmin()

  const photos = await prisma.photoReport.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="grid gap-8">
      <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
        <div className="text-lg font-semibold text-gray-900">Добавить фотоотчёт</div>

        <UploadPhotoClient targetInputId="imageUrl" />

        <form action={createPhoto} className="mt-4 grid gap-3 md:max-w-2xl">
          <input
            name="title"
            placeholder="Название"
            className="h-11 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300"
            required
          />
          <input
            name="imageUrl"
            id="imageUrl"
            placeholder="URL картинки"
            className="h-11 rounded-md border border-indigo-100 bg-white px-3 text-sm outline-none focus:border-indigo-300"
            required
          />
          <button className="h-11 rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-700">
            Сохранить
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-indigo-100 bg-white p-7 shadow-sm">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-gray-900">Список</div>
            <div className="mt-1 text-sm text-gray-600">Редактирование и удаление фотоотчётов.</div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {photos.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-2xl border border-indigo-100 bg-white">
              <div className="relative aspect-[4/3]">
                <Image src={p.imageUrl} alt={p.title} fill className="object-cover" />
              </div>

              <div className="p-4">
                <div className="text-sm font-semibold text-gray-900 line-clamp-2">{p.title}</div>
                <div className="mt-1 text-xs text-gray-500">
                  {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(p.createdAt)}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`/admin/gallery/${p.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-indigo-100 bg-white px-3 text-xs font-semibold text-gray-900 hover:border-indigo-200 hover:bg-indigo-50"
                  >
                    Редактировать
                  </Link>

                  <form action={deletePhoto}>
                    <input name="id" type="hidden" value={p.id} />
                    <button className="inline-flex h-9 items-center justify-center rounded-md border border-rose-100 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:border-rose-200">
                      Удалить
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}

          {!photos.length ? <div className="text-sm text-gray-600">Пока пусто.</div> : null}
        </div>
      </div>
    </div>
  )
}
