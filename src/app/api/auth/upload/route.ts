import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST() {
    return NextResponse.json({ ok: false, message: "Upload is not configured" }, { status: 501 })
}

export async function GET() {
    return NextResponse.json({ ok: true })
}

export {}
