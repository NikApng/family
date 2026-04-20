import { prisma } from "@/lib/prisma"

let reviewLoadErrorLogged = false

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

export async function getApprovedReviews(limit = 6) {
  try {
    return await prisma.review.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: limit,
    })
  } catch (error) {
    if (!reviewLoadErrorLogged) {
      reviewLoadErrorLogged = true
      console.warn(`Failed to load approved reviews, rendering fallback: ${getErrorMessage(error)}`)
    }

    return []
  }
}
