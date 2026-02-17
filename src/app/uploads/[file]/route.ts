import { access, readFile } from "fs/promises"
import { constants } from "fs"
import path from "path"
import { getPublicUploadsDir, getUploadsDir, sanitizeUploadFilename } from "@/lib/uploadsStorage"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Ctx = { params: Promise<{ file: string }> }

const MIME_BY_EXT: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
}

async function readIfExists(fullPath: string) {
  try {
    await access(fullPath, constants.R_OK)
    return await readFile(fullPath)
  } catch {
    return null
  }
}

export async function GET(_: Request, { params }: Ctx) {
  const { file: rawFile } = await params
  const file = sanitizeUploadFilename(rawFile)
  if (!file) return new Response("Not Found", { status: 404 })

  const primaryPath = path.join(getUploadsDir(), file)
  let body = await readIfExists(primaryPath)

  if (!body) {
    const fallbackPath = path.join(getPublicUploadsDir(), file)
    if (path.resolve(fallbackPath) !== path.resolve(primaryPath)) {
      body = await readIfExists(fallbackPath)
    }
  }

  if (!body) return new Response("Not Found", { status: 404 })

  const ext = path.extname(file).toLowerCase()
  const contentType = MIME_BY_EXT[ext] ?? "application/octet-stream"

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  })
}
