import { prisma } from "@/lib/prisma"
import { Section } from "@/components/Section"

export default async function EventsPage() {
    const events = await prisma.event.findMany({ orderBy: { date: "asc" } })

    return (
        <Section title="Афиша мероприятий" subtitle="Встречи и события организации.">
            <div className="grid gap-4 md:grid-cols-2">
                {events.map((e) => (
                    <div key={e.id} className="rounded-2xl border bg-white p-6">
                        <div className="text-sm text-muted-foreground">
                            {new Intl.DateTimeFormat("ru-RU", { dateStyle: "full", timeStyle: "short" }).format(e.date)}
                        </div>
                        <div className="mt-1 text-xl font-semibold">{e.title}</div>
                        <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{e.description}</div>
                        {e.place ? <div className="mt-4 text-sm">Место: {e.place}</div> : null}
                    </div>
                ))}
                {!events.length ? (
                    <div className="rounded-2xl border bg-white p-6 text-sm text-muted-foreground">
                        Пока нет опубликованных мероприятий.
                    </div>
                ) : null}
            </div>
        </Section>
    )
}
