import { createHash } from "crypto"

export function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex")
}

export function hashIp(ip: string | null | undefined) {
  const value = String(ip ?? "").trim()
  if (!value) return null

  const secret = process.env.NEXTAUTH_SECRET ?? ""
  return sha256Hex(value + secret)
}

