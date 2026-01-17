import Link from "next/link"

export function AdminNav() {
    return (
        <div className="flex gap-4 text-sm">
            <Link href="/admin/events" className="hover:underline">Мероприятия</Link>
            <Link href="/admin/gallery" className="hover:underline">Фото</Link>
            <Link href="/" className="text-muted-foreground hover:text-slate-900">На сайт</Link>
        </div>
    )
}
