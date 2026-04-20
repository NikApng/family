import "./globals.css"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Script from "next/script"
import { SiteHeader } from "@/components/SiteHeader"
import { SiteFooter } from "@/components/SiteFooter"

export const metadata: Metadata = {
    title: "Про Семью, Про Единство",
    description: "Психологическая поддержка гражданам и их семьям.",
    icons: {
        icon: "/images/image.png",
        shortcut: "/images/image.png",
        apple: "/images/image.png",
    },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const pathname = (await headers()).get("x-admin-pathname") ?? ""
    const isAdminRoute = pathname.startsWith("/admin")

    return (
        <html lang="ru" suppressHydrationWarning>
        <head>
            <Script id="theme-init" strategy="beforeInteractive">{`
try {
  var storageKey = "pfu-theme";
  var theme = localStorage.getItem(storageKey);
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  var isDark = theme ? theme === "dark" : prefersDark;
  var root = document.documentElement;
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
} catch (_) {}
            `}</Script>
        </head>
        <body className="bg-bg text-text">
        <div className="min-h-dvh flex flex-col">
            {isAdminRoute ? null : <SiteHeader />}
            <main className="flex-1">{children}</main>
            {isAdminRoute ? null : <SiteFooter />}
        </div>
        </body>
        </html>
    )
}
