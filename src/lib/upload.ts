import path from "path"
import fs from "fs/promises"

export async function saveFileToPublicUploads(file: File) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const safeName = `${Date.now()}-${file.name}`.replaceAll(" ", "_")
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await fs.mkdir(uploadsDir, { recursive: true })

    const fullPath = path.join(uploadsDir, safeName)
    await fs.writeFile(fullPath, buffer)

    return `/uploads/${safeName}`
}
