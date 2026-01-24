import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import crypto from "crypto"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function ensureAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })
  }
  return null
}

export async function GET() {
  return NextResponse.json({ ok: true })
}

export async function POST(req: Request) {
  const denied = await ensureAdmin()
  if (denied) return denied

  const formData = await req.formData().catch(() => null)
  const file = formData?.get("file") ?? null

  if (!file || typeof file === "string") {
    return NextResponse.json({ ok: false, error: "FILE_REQUIRED" }, { status: 400 })
  }

  if (!file.type?.startsWith("image/")) {
    return NextResponse.json({ ok: false, error: "INVALID_FILE_TYPE" }, { status: 400 })
  }

  const maxBytes = 8 * 1024 * 1024
  if (file.size > maxBytes) {
    return NextResponse.json({ ok: false, error: "FILE_TOO_LARGE" }, { status: 400 })
  }

  const allowedExt = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"])
  const extFromName = path.extname(file.name ?? "").toLowerCase()
  const extFromMime = String(file.type.split("/")[1] ?? "").toLowerCase()
  const extCandidate = extFromName || (extFromMime ? `.${extFromMime}` : "")
  const ext = allowedExt.has(extCandidate) ? extCandidate : ".png"

  const uploadsDir = path.join(process.cwd(), "public", "uploads")
  await mkdir(uploadsDir, { recursive: true })

  const filename = `${crypto.randomUUID()}${ext}`
  const filePath = path.join(uploadsDir, filename)

  const bytes = await file.arrayBuffer()
  await writeFile(filePath, Buffer.from(bytes))

  return NextResponse.json({ ok: true, url: `/uploads/${filename}` }, { status: 201 })
}

