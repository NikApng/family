import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { eventSchema } from "@/lib/validators"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

type Ctx = { params: Promise<{ id: string }> }

async function ensureAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })
  }
  return null
}

export async function GET(_: Request, { params }: Ctx) {
  const { id } = await params

  const item = await prisma.event.findUnique({ where: { id } })
  if (!item) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 })

  return NextResponse.json(item)
}

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await ensureAdmin()
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
      imageUrl: (parsed.data.imageUrl ?? "").trim() || null,
    },
  })

  revalidatePath("/")
  revalidatePath("/events")

  return NextResponse.json(updated)
}

export async function DELETE(_: Request, { params }: Ctx) {
  const denied = await ensureAdmin()
  if (denied) return denied

  const { id } = await params

  await prisma.event.delete({ where: { id } })
  revalidatePath("/")
  revalidatePath("/events")
  return NextResponse.json({ ok: true })
}
