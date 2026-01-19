-- CreateTable
CREATE TABLE "Specialist" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "badgeTone" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Specialist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Specialist_slug_key" ON "Specialist"("slug");
