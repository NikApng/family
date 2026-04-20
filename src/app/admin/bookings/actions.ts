"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function deleteBookingAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  if (!id) return

  await prisma.bookingRequest.delete({
    where: { id },
  })

  revalidatePath("/admin/bookings")
}
