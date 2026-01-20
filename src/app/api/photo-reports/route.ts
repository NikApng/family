import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

type CreateBody = {
  title: string
  imageUrl: string
  sortOrder?: number
  isPublished?: boolean
}

export async function GET() {
  const items = await prisma.photoReport.findMany({
    orderBy: [{ createdAt: "desc" }],
  })

  return Response.json(items)
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<CreateBody>

  const title = String(body.title ?? "").trim()
  const imageUrl = String(body.imageUrl ?? "").trim()

  if (!title) return new Response("title is required", { status: 400 })
  if (!imageUrl) return new Response("imageUrl is required", { status: 400 })

  const created = await prisma.photoReport.create({
    data: {
      title,
      imageUrl,
    },
  })

  return Response.json(created, { status: 201 })
}
