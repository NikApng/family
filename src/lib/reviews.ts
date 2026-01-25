import { prisma } from "@/lib/prisma"

export async function getApprovedReviews(limit = 6) {
  return prisma.review.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

