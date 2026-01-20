import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

type Ctx = { params: Promise<{ id: string }> }

type UpdateBody = {
  title?: string
  imageUrl?: string
}

function toId(value: string) {
  return String(value ?? "").trim()
}

export async function GET(_: NextRequest, { params }: Ctx) {
  const { id: rawId } = await params
  const id = toId(rawId)
  if (!id) return new Response("Bad Request", { status: 400 })

  const item = await prisma.photoReport.findUnique({ where: { id } })
  if (!item) return new Response("Not Found", { status: 404 })

  return Response.json(item)
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id: rawId } = await params
  const id = toId(rawId)
  if (!id) return new Response("Bad Request", { status: 400 })

  const body = (await req.json()) as Partial<UpdateBody>

  const title = String(body.title ?? "").trim()
  const imageUrl = String(body.imageUrl ?? "").trim()

  if (!title) return new Response("title is required", { status: 400 })
  if (!imageUrl) return new Response("imageUrl is required", { status: 400 })

  const updated = await prisma.photoReport.update({
    where: { id },
    data: {
      title,
      imageUrl,
    },
  })

  return Response.json(updated)
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const { id: rawId } = await params
  const id = toId(rawId)
  if (!id) return new Response("Bad Request", { status: 400 })

  await prisma.photoReport.delete({ where: { id } })

  return new Response(null, { status: 204 })
}
