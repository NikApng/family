import { prisma } from "@/lib/prisma"

type Params = { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
  const item = await prisma.specialist.findUnique({ where: { id: params.id } })
  if (!item) return new Response("Not found", { status: 404 })
  return Response.json(item)
}

export async function PATCH(req: Request, { params }: Params) {
  const body = await req.json()

  const updated = await prisma.specialist.update({
    where: { id: params.id },
    data: {
      slug: body.slug,
      badge: body.badge,
      badgeTone: body.badgeTone,
      role: body.role,
      name: body.name,
      excerpt: body.excerpt,
      bio: body.bio,
      isPublished: Boolean(body.isPublished),
      sortOrder: Number(body.sortOrder ?? 0),
    },
  })

  return Response.json(updated)
}

export async function DELETE(_: Request, { params }: Params) {
  await prisma.specialist.delete({ where: { id: params.id } })
  return new Response(null, { status: 204 })
}
