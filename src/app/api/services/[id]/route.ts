import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { serviceSchema } from "@/lib/validators"

type Ctx = { params: Promise<{ id: string }> }

function normalizeSlug(value: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-|\-$/g, "")
}

async function ensureAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })
  }
  return null
}

export async function GET(_: Request, { params }: Ctx) {
  const denied = await ensureAdmin()
  if (denied) return denied

  const { id } = await params

  const item = await prisma.service.findUnique({ where: { id } })
  if (!item) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 })

  return NextResponse.json(item)
}

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await ensureAdmin()
  if (denied) return denied

  const { id } = await params

  const existing = await prisma.service.findUnique({ where: { id }, select: { slug: true } })
  if (!existing) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 })

  const body = await req.json().catch(() => null)
  const parsed = serviceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "VALIDATION_ERROR" }, { status: 400 })
  }

  const slug = normalizeSlug(parsed.data.slug)
  if (!slug) return NextResponse.json({ ok: false, error: "INVALID_SLUG" }, { status: 400 })

  const blocks = (parsed.data.blocks ?? [])
    .map((b) => ({
      title: String(b.title ?? "").trim(),
      text: String(b.text ?? "").trim(),
    }))
    .filter((b) => b.title || b.text)

  try {
    const updated = await prisma.service.update({
      where: { id },
      data: {
        slug,
        title: parsed.data.title.trim(),
        intro: parsed.data.intro.trim(),
        blocks,
        isPublished: Boolean(parsed.data.isPublished),
        sortOrder: Number(parsed.data.sortOrder ?? 0),
      },
    })

    revalidatePath("/services")
    revalidatePath(`/services/${existing.slug}`)
    revalidatePath(`/services/${updated.slug}`)

    return NextResponse.json(updated)
  } catch (err) {
    console.error("Failed to update Service", err)
    return NextResponse.json({ ok: false, error: "UPDATE_FAILED" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  const denied = await ensureAdmin()
  if (denied) return denied

  const { id } = await params

  const existing = await prisma.service.findUnique({ where: { id }, select: { slug: true } })
  if (!existing) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 })

  await prisma.service.delete({ where: { id } })

  revalidatePath("/services")
  revalidatePath(`/services/${existing.slug}`)

  return NextResponse.json({ ok: true })
}

