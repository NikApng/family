import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { serviceSchema } from "@/lib/validators"

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

export async function GET() {
  const session = await getServerSession(authOptions)

  const items = await prisma.service.findMany({
    where: session ? undefined : { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  })

  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const denied = await ensureAdmin()
  if (denied) return denied

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
    const created = await prisma.service.create({
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
    revalidatePath(`/services/${created.slug}`)

    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    console.error("Failed to create Service", err)
    return NextResponse.json({ ok: false, error: "CREATE_FAILED" }, { status: 500 })
  }
}

