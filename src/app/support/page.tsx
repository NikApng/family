import { Section } from "@/components/Section"

export default function SupportPage() {
    return (
        <Section
            title="Помощь проекту"
            subtitle="Если вы хотите поддержать организацию - спасибо. Это действительно важно."
        >
            <div className="grid gap-4 md:grid-cols-2 md:auto-rows-fr md:gap-6">
                <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
                    <div className="text-lg font-semibold leading-tight">Пожертвование</div>
                    <div className="mt-2 flex-1 text-sm leading-6 text-muted md:min-h-[72px]">
                        Любая сумма помогает проводить консультации и встречи поддержки.
                    </div>
                    <div className="mt-6 rounded-md border border-border bg-bg px-4 py-3 text-sm text-muted">
                        Реквизиты/ссылка на оплату добавятся
                    </div>
                </div>

                <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
                    <div className="text-lg font-semibold leading-tight">Волонтёрство</div>
                    <div className="mt-2 flex-1 text-sm leading-6 text-muted md:min-h-[72px]">
                        Можно помогать организационно, информационно или в сопровождении мероприятий.
                    </div>
                    <div className="mt-6 rounded-md border border-border bg-bg px-4 py-3 text-sm text-muted">
                        Контакт для волонтёров добавится
                    </div>
                </div>
            </div>
        </Section>
    )
}
