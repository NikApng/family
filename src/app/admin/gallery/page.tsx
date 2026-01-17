import { prisma } from "@/lib/prisma"
import { photoSchema } from "@/lib/validators"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Image from "next/image"

async function ensureAdmin() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/admin")
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
            imageUrl: parsed.data.url,
            title: parsed.data.title?.trim() || "",

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
    const photos = await prisma.photoReport.findMany({ orderBy: { createdAt: "desc" } })

    return (
        <div className="grid gap-8">
            <div className="rounded-2xl border bg-white p-6">
                <div className="text-lg font-semibold">Добавить фотоотчёт</div>
                <PhotoForm />
                <form action={createPhoto} className="mt-4 grid gap-3 md:max-w-2xl">
                    <input name="title" placeholder="Название" className="h-11 rounded-md border bg-white px-3 text-sm" required />
                    <input name="imageUrl" id="imageUrl" placeholder="URL картинки" className="h-11 rounded-md border bg-white px-3 text-sm" required />
                    <button className="h-11 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:opacity-90">
                        Сохранить
                    </button>
                </form>
            </div>

            <div className="rounded-2xl border bg-white p-6">
                <div className="text-lg font-semibold">Список</div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {photos.map((p) => (
                        <div key={p.id} className="overflow-hidden rounded-2xl border">
                            <div className="relative aspect-[4/3]">
                                <Image src={p.imageUrl} alt={p.title} fill className="object-cover" />
                            </div>
                            <div className="flex items-center justify-between gap-3 p-4">
                                <div className="text-sm font-medium line-clamp-2">{p.title}</div>
                                <form action={deletePhoto}>
                                    <input name="id" type="hidden" value={p.id} />
                                    <button className="rounded-md border px-3 py-2 text-sm hover:bg-accent">Удалить</button>
                                </form>
                            </div>
                        </div>
                    ))}
                    {!photos.length ? <div className="text-sm text-muted-foreground">Пока пусто.</div> : null}
                </div>
            </div>
        </div>
    )
}

function PhotoForm() {
    return (
        <div className="mt-4 rounded-xl border bg-muted/20 p-4 text-sm">
            <div className="font-medium">Загрузка файла</div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
                <input id="file" type="file" accept="image/*" className="text-sm" />
                <button
                    type="button"
                    className="rounded-md border px-3 py-2 text-sm hover:bg-accent"
                    onClick={async () => {
                        const input = document.getElementById("file") as HTMLInputElement | null
                        const urlInput = document.getElementById("imageUrl") as HTMLInputElement | null
                        const file = input?.files?.[0]
                        if (!file || !urlInput) return

                        const fd = new FormData()
                        fd.append("file", file)
                        const res = await fetch("/api/upload", { method: "POST", body: fd })
                        const json = (await res.json()) as { ok: boolean; url?: string }
                        if (json.ok && json.url) urlInput.value = json.url
                    }}
                >
                    Загрузить
                </button>
                <div className="text-muted-foreground">Файл сохранится в public/uploads</div>
            </div>
        </div>
    )
}
