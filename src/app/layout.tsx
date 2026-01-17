import "./globals.css"
import type { Metadata } from "next"
import { SiteHeader } from "@/components/SiteHeader"
import { SiteFooter } from "@/components/SiteFooter"

export const metadata: Metadata = {
    title: "Про Семью, Про Единство",
    description: "Психологическая поддержка гражданам и их семьям.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru">
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
