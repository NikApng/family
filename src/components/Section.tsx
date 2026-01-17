export function Section({
                            title,
                            subtitle,
                            children,
                        }: {
    title?: string
    subtitle?: string
    children: React.ReactNode
}) {
    return (
        <section className="py-14">
            <div className="mx-auto w-full max-w-6xl px-4">
                {title ? (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
                        {subtitle ? <p className="mt-2 text-muted">{subtitle}</p> : null}
                    </div>
                ) : null}
                {children}
            </div>
        </section>
    )
}
