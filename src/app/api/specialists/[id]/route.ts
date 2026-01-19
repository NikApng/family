import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

type Ctx = { params: Promise<{ id: string }> }

function toId(value: string) {
  return String(value ?? "").trim()
}

export async function GET(_: NextRequest, { params }: Ctx) {
  const { id: rawId } = await params
  const id = toId(rawId)

  if (!id) return new Response("Bad Request", { status: 400 })

  const item = await prisma.specialist.findUnique({ where: { id } })
  if (!item) return new Response("Not Found", { status: 404 })

  return Response.json(item)
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id: rawId } = await params
  const id = toId(rawId)

  if (!id) return new Response("Bad Request", { status: 400 })

  const body = await req.json()

  const updated = await prisma.specialist.update({
    where: { id },
    data: {
      slug: String(body.slug ?? "").trim(),
      badge: String(body.badge ?? "").trim(),
      badgeTone: String(body.badgeTone ?? "").trim(),
      role: String(body.role ?? "").trim(),
      name: String(body.name ?? "").trim(),
      excerpt: String(body.excerpt ?? "").trim(),
      bio: String(body.bio ?? "").trim(),
      isPublished: Boolean(body.isPublished),
      sortOrder: Number(body.sortOrder ?? 0),
    },
  })

  return Response.json(updated)
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const { id: rawId } = await params
  const id = toId(rawId)

  if (!id) return new Response("Bad Request", { status: 400 })

  await prisma.specialist.delete({ where: { id } })

  return new Response(null, { status: 204 })
}
