import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLoginPage() {
    const session = await getServerSession(authOptions)
    if (session) redirect("/admin/events")

    return (
        <div className="mx-auto w-full max-w-md rounded-2xl border bg-white p-6">
            <div className="text-xl font-semibold">Вход</div>
            <form className="mt-6 grid gap-3" method="post" action="/api/auth/callback/credentials">
                <input name="csrfToken" type="hidden" />
                <input name="email" placeholder="Email" className="h-11 rounded-md border bg-white px-3 text-sm" required />
                <input name="password" type="password" placeholder="Пароль" className="h-11 rounded-md border bg-white px-3 text-sm" required />
                <button className="h-11 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:opacity-90">
                    Войти
                </button>
            </form>
            <div className="mt-3 text-xs text-muted-foreground">
                Данные админа берутся из .env
            </div>
        </div>
    )
}
