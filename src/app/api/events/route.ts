import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { eventSchema } from "@/lib/validators"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function ensureAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })
  }
  return null
}

export async function GET() {
  const items = await prisma.event.findMany({
    orderBy: { date: "asc" },
  })

  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const denied = await ensureAdmin()
  if (denied) return denied

  const body = await req.json().catch(() => null)

  const parsed = eventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "VALIDATION_ERROR" }, { status: 400 })
  }

  const created = await prisma.event.create({
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

  return NextResponse.json(created, { status: 201 })
}
