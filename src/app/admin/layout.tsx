import { AdminNav } from "@/components/AdminNav"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
            <div className="flex items-center justify-between">
                <div className="text-xl font-semibold">Админка</div>
                <AdminNav />
            </div>
            <div className="mt-8">{children}</div>
        </div>
    )
}
