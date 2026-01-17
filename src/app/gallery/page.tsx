import { prisma } from "@/lib/prisma"
import { Section } from "@/components/Section"
import Image from "next/image"

export default async function GalleryPage() {
    const photos = await prisma.photoReport.findMany({ orderBy: { createdAt: "desc" } })

    return (
        <Section title="Фотоотчёты" subtitle="Тёплые моменты встреч и мероприятий.">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {photos.map((p) => (
                    <div key={p.id} className="overflow-hidden rounded-2xl border bg-white">
                        <div className="relative aspect-[4/3]">
                            <Image src={p.imageUrl} alt={p.title} fill className="object-cover" />
                        </div>
                        <div className="p-4 text-sm font-medium">{p.title}</div>
                    </div>
                ))}
                {!photos.length ? (
                    <div className="rounded-2xl border bg-white p-6 text-sm text-muted-foreground">
                        Пока нет опубликованных фотоотчётов.
                    </div>
                ) : null}
            </div>
        </Section>
    )
}
