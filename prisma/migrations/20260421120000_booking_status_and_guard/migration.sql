CREATE TYPE "BookingStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'DONE', 'SPAM');

ALTER TABLE "BookingRequest"
  ADD COLUMN "status" "BookingStatus" NOT NULL DEFAULT 'NEW',
  ADD COLUMN "ipHash" TEXT,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "BookingRequest_status_idx" ON "BookingRequest"("status");
CREATE INDEX "BookingRequest_createdAt_idx" ON "BookingRequest"("createdAt");
CREATE INDEX "BookingRequest_ipHash_createdAt_idx" ON "BookingRequest"("ipHash", "createdAt");
