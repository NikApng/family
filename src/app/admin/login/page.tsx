import { Suspense } from "react"
import LoginClient from "./ui/LoginClient"

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-600">Загрузка...</div>}>
      <LoginClient />
    </Suspense>
  )
}
