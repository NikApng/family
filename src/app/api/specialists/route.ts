import { prisma } from "@/lib/prisma"

export async function GET() {
  const items = await prisma.specialist.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  })
  return Response.json(items)
}

export async function POST(req: Request) {
  const body = await req.json()

  const created = await prisma.specialist.create({
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

  return Response.json(created, { status: 201 })
}
