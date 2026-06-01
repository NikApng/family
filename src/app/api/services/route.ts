import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { decode } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"
import { serviceSchema } from "@/lib/validators"
import { requireAdmin } from "@/lib/requireAdmin"

function normalizeSlug(value: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

async function isAdmin(): Promise<boolean> {
  try {
    const store = await cookies()
    const secure = process.env.NEXTAUTH_URL?.startsWith("https://")
    const name = secure ? "__Secure-next-auth.session-token" : "next-auth.session-token"
    const raw = store.get(name)?.value
    if (!raw) return false
    const decoded = await decode({ token: raw, secret: process.env.NEXTAUTH_SECRET ?? "" })
    return !!decoded
  } catch {
    return false
  }
}

export async function GET() {
  const admin = await isAdmin()
  const items = await prisma.service.findMany({
    where: admin ? undefined : { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const body = await req.json().catch(() => null)
  const parsed = serviceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "VALIDATION_ERROR" }, { status: 400 })
  }

  const slug = normalizeSlug(parsed.data.slug)
  if (!slug) return NextResponse.json({ ok: false, error: "INVALID_SLUG" }, { status: 400 })

  const blocks = (parsed.data.blocks ?? [])
    .map((b) => ({ title: String(b.title ?? "").trim(), text: String(b.text ?? "").trim() }))
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
