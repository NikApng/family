import "./globals.css"
import type { Metadata } from "next"
import Script from "next/script"
import { SiteHeader } from "@/components/SiteHeader"
import { SiteFooter } from "@/components/SiteFooter"

export const metadata: Metadata = {
    title: "Про Семью, Про Единство",
    description: "Психологическая поддержка гражданам и их семьям.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
        </div>
        </body>
        </html>
    )
}
