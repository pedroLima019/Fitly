-- DropIndex
DROP INDEX "Message_createdAt_idx";

-- CreateIndex
CREATE INDEX "ClientRequest_studentId_status_idx" ON "ClientRequest"("studentId", "status");

-- CreateIndex
CREATE INDEX "ClientRequest_personalId_status_deletedAt_idx" ON "ClientRequest"("personalId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "ClientRequest_status_idx" ON "ClientRequest"("status");

-- CreateIndex
CREATE INDEX "Message_personalId_createdAt_idx" ON "Message"("personalId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_studentId_readAt_idx" ON "Message"("studentId", "readAt");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_readAt_idx" ON "Message"("readAt");
