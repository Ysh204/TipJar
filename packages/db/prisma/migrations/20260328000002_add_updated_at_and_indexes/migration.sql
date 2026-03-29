-- Add updatedAt to User and Tip tables
ALTER TABLE "User" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Tip"  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Add indexes on Tip for query performance
CREATE INDEX "Tip_fromUserId_idx"  ON "Tip"("fromUserId");
CREATE INDEX "Tip_toCreatorId_idx" ON "Tip"("toCreatorId");
CREATE INDEX "Tip_createdAt_idx"   ON "Tip"("createdAt");
