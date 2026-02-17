"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type NavItem = {
  href: string
  label: string
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminNav({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname() ?? ""

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {items.map((x) => {
        const active = isActive(pathname, x.href)
        return (
          <Link
            key={x.href}
            href={x.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900"
                : "rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-indigo-50 hover:text-gray-900"
            }
          >
            {x.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminNavMobile({ items }: { items: readonly NavItem[] }) {
  const pathname = usePathname() ?? ""

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-3 md:hidden">
      <div className="flex flex-wrap gap-2">
        {items.map((x) => {
          const active = isActive(pathname, x.href)
          return (
            <Link
              key={x.href}
              href={x.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900"
                  : "rounded-md border border-indigo-100 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-gray-900"
              }
            >
              {x.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
