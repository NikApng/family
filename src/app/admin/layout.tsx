import Link from "next/link"

import { getServerSession } from "next-auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

const LOGIN_PATH = "/admin/login"

const NAV_ITEMS = [
  { href: "/admin/specialists", label: "Специалисты" },
  { href: "/admin/services", label: "Услуги" },
  { href: "/admin/events", label: "Афиша" },
  { href: "/admin/reviews", label: "Отзывы" },
  { href: "/admin/gallery", label: "Фотоотчёты" },
  { href: "/admin/texts", label: "Тексты" },
]

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const pathname = (await headers()).get("x-admin-pathname") ?? ""
  const isLoginPage = pathname === LOGIN_PATH

  if (!session && !isLoginPage) redirect(LOGIN_PATH)

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <header className="sticky top-16 z-20 border-b border-indigo-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-semibold text-gray-900">
              Про Семью, Про Единство
            </Link>
            <div className="hidden h-5 w-px bg-indigo-100 md:block" />
            <nav className="hidden items-center gap-1 md:flex">
              {NAV_ITEMS.map((x) => (
                <Link
                  key={x.href}
                  href={x.href}
                  className="rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-indigo-50 hover:text-gray-900"
                >
                  {x.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-md border border-indigo-100 bg-white px-4 text-sm font-semibold leading-none text-gray-900 hover:border-indigo-200 hover:bg-indigo-50"
            >
              На сайт
            </Link>
            <Link
              href="/admin/login"
              className="inline-flex h-10 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-semibold leading-none text-white hover:bg-indigo-700"
            >
              Выйти
            </Link>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 pb-3 md:hidden">
          <div className="flex flex-wrap gap-2">
            {NAV_ITEMS.map((x) => (
              <Link
                key={x.href}
                href={x.href}
                className="rounded-md border border-indigo-100 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-gray-900"
              >
                {x.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10">{children}</main>
    </div>
  )
}
