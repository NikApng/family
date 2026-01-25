"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export async function approveReviewAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  if (!id) return

  await prisma.review.update({
    where: { id },
    data: { status: "APPROVED", approvedAt: new Date() },
  })

  revalidatePath("/")
  revalidatePath("/reviews")
  revalidatePath("/admin/reviews")
}

export async function rejectReviewAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  if (!id) return

  await prisma.review.update({
    where: { id },
    data: { status: "REJECTED" },
  })

  revalidatePath("/")
  revalidatePath("/reviews")
  revalidatePath("/admin/reviews")
}

export async function deleteReviewAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  if (!id) return

  await prisma.review.delete({ where: { id } })

  revalidatePath("/")
  revalidatePath("/reviews")
  revalidatePath("/admin/reviews")
}

