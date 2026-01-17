"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"

const nav = [
    { href: "/#what", label: "Что мы делаем" },
    { href: "/#specialists", label: "Специалисты" },
    { href: "/#reviews", label: "Отзывы" },
    { href: "/services/online", label: "Услуги" },
    { href: "/events", label: "Афиша" },
    { href: "/gallery", label: "Фотоотчёты" },
    { href: "/contacts", label: "Контакты" },
]

function getHash(href: string) {
    const i = href.indexOf("#")
    return i >= 0 ? href.slice(i + 1) : ""
}

function getPath(href: string) {
    const i = href.indexOf("#")
    return i >= 0 ? href.slice(0, i) || "/" : href
}

export function SiteHeader() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        setOpen(false)
    }, [pathname])

    const onNavClick = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
        const hash = getHash(href)
        if (!hash) {
            setOpen(false)
            return
        }

        e.preventDefault()

        const targetId = hash
        const targetPath = getPath(href)
        const offset = 88

        const scrollToId = () => {
            const el = document.getElementById(targetId)
            if (!el) return
            const top = el.getBoundingClientRect().top + window.scrollY - offset
            window.scrollTo({ top, behavior: "smooth" })
        }

        if (pathname !== targetPath) {
            router.push(href)
            requestAnimationFrame(() => setTimeout(scrollToId, 60))
            setOpen(false)
            return
        }

        scrollToId()
        setOpen(false)
    }

    return (
        <header className="sticky top-0 z-50 border-b border-indigo-100 bg-white/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
                <Link href="/" className="flex items-center gap-3">
          <span className="relative h-6 w-8 overflow-hidden rounded-sm border border-indigo-100">
            <Image src="/images/img.png" alt="Флаг" fill className="object-cover" />
          </span>
                    <span className="text-sm font-semibold tracking-tight text-gray-900 sm:text-base">
            Про Семью, Про Единство
          </span>
                </Link>

                <nav className="hidden items-center gap-6 md:flex">
                    {nav.map((x) => (
                        <Link
                            key={x.href}
                            href={x.href}
                            onClick={onNavClick(x.href)}
                            className="text-sm font-medium text-gray-700 hover:text-indigo-700"
                        >
                            {x.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <Link
                        href="/#book"
                        onClick={onNavClick("/#book")}
                        className="hidden h-10 items-center justify-center rounded-md bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow sm:inline-flex"
                    >
                        Обратиться
                    </Link>

                    <button
                        type="button"
                        aria-label="Открыть меню"
                        onClick={() => setOpen((v) => !v)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-indigo-100 bg-white text-gray-900 shadow-sm transition hover:bg-indigo-50 md:hidden"
                    >
                        {open ? "✕" : "☰"}
                    </button>
                </div>
            </div>

            {open ? (
                <div className="border-t border-indigo-100 bg-white md:hidden">
                    <div className="mx-auto w-full max-w-6xl px-4 py-3">
                        <div className="grid gap-2">
                            {nav.map((x) => (
                                <Link
                                    key={x.href}
                                    href={x.href}
                                    onClick={onNavClick(x.href)}
                                    className="flex h-11 items-center rounded-xl border border-indigo-100 bg-white px-4 text-sm font-semibold text-gray-900 shadow-sm transition hover:bg-indigo-50"
                                >
                                    {x.label}
                                </Link>
                            ))}

                            <Link
                                href="/#book"
                                onClick={onNavClick("/#book")}
                                className="mt-1 flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow"
                            >
                                Обратиться
                            </Link>
                        </div>
                    </div>
                </div>
            ) : null}
        </header>
    )
}
