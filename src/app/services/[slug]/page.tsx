import { services, type ServiceSlug } from "@/lib/services"
import { Section } from "@/components/Section"
import Link from "next/link"
import { notFound } from "next/navigation"

export default function ServicePage({ params }: { params: { slug: string } }) {
    const slug = params.slug as ServiceSlug
    const data = services[slug]
    if (!data) notFound()

    return (
        <div>
            <section className="border-b">
                <div className="mx-auto w-full max-w-6xl px-4 py-14">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl font-semibold tracking-tight">{data.title}</h1>
                        <p className="mt-4 text-muted-foreground">{data.intro}</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href="/#book" className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                                Записаться
                            </Link>
                            <Link href="/contacts" className="rounded-md border px-5 py-2.5 text-sm font-medium hover:bg-accent">
                                Задать вопрос
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Section title="Подробности">
                <div className="grid gap-4 md:grid-cols-3">
                    {data.blocks.map((b) => (
                        <div key={b.title} className="rounded-2xl border bg-white p-6">
                            <div className="font-medium">{b.title}</div>
                            <div className="mt-2 text-sm text-muted-foreground">{b.text}</div>
                        </div>
                    ))}
                </div>
            </Section>
        </div>
    )
}
