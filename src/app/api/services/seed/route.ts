import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { serviceDefaultsList } from "@/lib/services"

async function ensureAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })
  }
  return null
}

export async function POST() {
  const denied = await ensureAdmin()
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

