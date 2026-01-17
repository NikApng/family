import { prisma } from "@/lib/prisma"
import { eventSchema } from "@/lib/validators"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function ensureAdmin() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/admin")
}

async function createEvent(formData: FormData) {
    "use server"
    await ensureAdmin()

    const raw = {
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        date: String(formData.get("date") ?? ""),
        place: String(formData.get("place") ?? ""),
    }

    const parsed = eventSchema.safeParse(raw)
    if (!parsed.success) return

    await prisma.event.create({
        data: {
            title: parsed.data.title,
            description: parsed.data.description,
            date: new Date(parsed.data.date),
            place: parsed.data.place || null,
        },
    })

    revalidatePath("/events")
    revalidatePath("/admin/events")
}

async function deleteEvent(formData: FormData) {
    "use server"
    await ensureAdmin()

    const id = String(formData.get("id") ?? "")
    if (!id) return

    await prisma.event.delete({ where: { id } })
    revalidatePath("/events")
    revalidatePath("/admin/events")
}

export default async function AdminEventsPage() {
    await ensureAdmin()
    const events = await prisma.event.findMany({ orderBy: { date: "desc" } })

    return (
        <div className="grid gap-8">
            <div className="rounded-2xl border bg-white p-6">
                <div className="text-lg font-semibold">Добавить мероприятие</div>
                <form action={createEvent} className="mt-4 grid gap-3 md:max-w-2xl">
                    <input name="title" placeholder="Название" className="h-11 rounded-md border bg-white px-3 text-sm" required />
                    <textarea name="description" placeholder="Описание" className="min-h-28 rounded-md border bg-white px-3 py-3 text-sm" required />
                    <div className="grid gap-3 md:grid-cols-2">
                        <input name="date" type="datetime-local" className="h-11 rounded-md border bg-white px-3 text-sm" required />
                        <input name="place" placeholder="Место (необязательно)" className="h-11 rounded-md border bg-white px-3 text-sm" />
                    </div>
                    <button className="h-11 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:opacity-90">
                        Сохранить
                    </button>
                </form>
            </div>

            <div className="rounded-2xl border bg-white p-6">
                <div className="text-lg font-semibold">Список</div>
                <div className="mt-4 grid gap-3">
                    {events.map((e) => (
                        <div key={e.id} className="rounded-xl border p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(e.date)}
                                    </div>
                                    <div className="font-semibold">{e.title}</div>
                                </div>
                                <form action={deleteEvent}>
                                    <input name="id" type="hidden" value={e.id} />
                                    <button className="rounded-md border px-3 py-2 text-sm hover:bg-accent">Удалить</button>
                                </form>
                            </div>
                        </div>
                    ))}
                    {!events.length ? <div className="text-sm text-muted-foreground">Пока пусто.</div> : null}
                </div>
            </div>
        </div>
    )
}
