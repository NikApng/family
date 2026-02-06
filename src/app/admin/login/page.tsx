import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import LoginClient from "./ui/LoginClient"

export const dynamic = "force-dynamic"

export default async function AdminLoginPage() {
  const session = await getServerSession(authOptions)
  if (session) redirect("/admin")

  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-600">Загрузка...</div>}>
      <LoginClient />
    </Suspense>
  )
}
