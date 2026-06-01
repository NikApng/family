import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { eventSchema } from "@/lib/validators"
import { normalizeImageUrl } from "@/lib/imageUrl"
import { requireAdmin } from "@/lib/requireAdmin"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Ctx) {
  const { id } = await params

  const item = await prisma.event.findUnique({ where: { id } })
  if (!item) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 })

  return NextResponse.json(item)
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req)
  if (denied) return denied

  const { id } = await params

  const body = await req.json().catch(() => null)
  const parsed = eventSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "VALIDATION_ERROR" }, { status: 400 })
  }

  const updated = await prisma.event.update({
    where: { id },
    data: {
      title: parsed.data.title.trim(),
      description: parsed.data.description.trim(),
      date: parsed.data.date,
      place: (parsed.data.place ?? "").trim() || null,
      imageUrl: normalizeImageUrl(parsed.data.imageUrl) || null,
    },
  })

  revalidatePath("/")
  revalidatePath("/events")

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const denied = await requireAdmin(req)
  if (denied) return denied

  const { id } = await params

  await prisma.event.delete({ where: { id } })
  revalidatePath("/")
  revalidatePath("/events")
  return NextResponse.json({ ok: true })
}
