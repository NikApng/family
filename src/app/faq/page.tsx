import { Section } from "@/components/Section"

const items = [
    { q: "Это платно?", a: "Часть помощи может быть бесплатной. Уточните формат — мы подскажем варианты." },
    { q: "Можно ли обратиться из любого региона?", a: "Да, онлайн-формат доступен независимо от региона." },
    { q: "Будет ли конфиденциально?", a: "Да. Мы бережно относимся к личным данным и соблюдаем конфиденциальность." },
    { q: "Можно ли анонимно?", a: "Да, вы можете не указывать email и описывать ситуацию кратко." },
]

export default function FaqPage() {
    return (
        <Section title="FAQ" subtitle="Короткие ответы на частые вопросы.">
            <div className="grid gap-4 md:max-w-3xl">
                {items.map((x) => (
                    <div key={x.q} className="rounded-2xl border border-border bg-card p-6">
                        <div className="font-medium">{x.q}</div>
                        <div className="mt-2 text-sm text-muted">{x.a}</div>
                    </div>
                ))}
            </div>
        </Section>
    )
}
