import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { serviceDefaultsList } from "@/lib/services"
import { requireAdmin } from "@/lib/requireAdmin"

export async function POST() {
  const denied = await requireAdmin()
  if (denied) return denied

  for (const item of serviceDefaultsList) {
    await prisma.service.upsert({
      where: { slug: item.slug },
      create: {
        slug: item.slug,
        title: item.title,
        intro: item.intro,
        blocks: item.blocks,
        sortOrder: item.sortOrder,
        isPublished: true,
      },
      update: {
        title: item.title,
        intro: item.intro,
        blocks: item.blocks,
        sortOrder: item.sortOrder,
        isPublished: true,
      },
    })
  }

  revalidatePath("/services")
  for (const item of serviceDefaultsList) revalidatePath(`/services/${item.slug}`)
  return NextResponse.json({ ok: true })
}
