import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { reviewCreateSchema } from "@/lib/validators"
import { hashIp } from "@/lib/security/ipHash"

function getClientIp(req: NextRequest) {
  const direct = (req as unknown as { ip?: string }).ip
  if (direct) return direct.trim()

  const xff = req.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0]?.trim() ?? null

  const xRealIp = req.headers.get("x-real-ip")
  if (xRealIp) return xRealIp.trim()

  const cfIp = req.headers.get("cf-connecting-ip")
  if (cfIp) return cfIp.trim()

  return null
}

export async function POST(req: NextRequest) {
  try {
    const raw = (await req.json()) as unknown

    const website =
      typeof raw === "object" && raw !== null && "website" in raw
        ? String((raw as { website?: unknown }).website ?? "")
        : ""

    if (website.trim()) return NextResponse.json({ ok: true })

    const parsed = reviewCreateSchema.safeParse(raw)
    if (!parsed.success) return NextResponse.json({ ok: false, error: "validation" })

    const ipHash = hashIp(getClientIp(req))

    if (ipHash) {
      const windowStart = new Date(Date.now() - 10 * 60 * 1000)
      const recentCount = await prisma.review.count({
        where: { ipHash, createdAt: { gt: windowStart } },
      })

      if (recentCount >= 3) return NextResponse.json({ ok: false, error: "rate_limited" })
    }

    const text = parsed.data.text.trim()
    const authorNameRaw = String(parsed.data.name ?? "").trim()
    const isAnonymous = Boolean(parsed.data.isAnonymous)

    await prisma.review.create({
      data: {
        text,
        rating: parsed.data.rating,
        isAnonymous,
        authorName: isAnonymous ? null : authorNameRaw || null,
        ipHash,
      },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" })
  }
}

