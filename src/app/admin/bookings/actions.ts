"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

const bookingStatuses = new Set(["NEW", "IN_PROGRESS", "DONE", "SPAM"])

export async function deleteBookingAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  if (!id) return

  await prisma.bookingRequest.delete({
    where: { id },
  })

  revalidatePath("/admin/bookings")
}

export async function updateBookingStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  const status = String(formData.get("status") ?? "")

  if (!id || !bookingStatuses.has(status)) return

  await prisma.bookingRequest.update({
    where: { id },
    data: { status: status as "NEW" | "IN_PROGRESS" | "DONE" | "SPAM" },
  })

  revalidatePath("/admin/bookings")
}
