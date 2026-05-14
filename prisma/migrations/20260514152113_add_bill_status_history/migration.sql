-- CreateTable
CREATE TABLE "BillStatusHistory" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "fromStatus" "BillStatus",
    "toStatus" "BillStatus" NOT NULL,
    "changedById" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BillStatusHistory_billId_idx" ON "BillStatusHistory"("billId");

-- CreateIndex
CREATE INDEX "BillStatusHistory_createdAt_idx" ON "BillStatusHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "BillStatusHistory" ADD CONSTRAINT "BillStatusHistory_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillStatusHistory" ADD CONSTRAINT "BillStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
