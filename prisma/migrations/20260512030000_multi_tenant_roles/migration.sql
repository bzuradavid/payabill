-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MANAGER', 'STAFF');

-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_userId_fkey";

-- DropForeignKey
ALTER TABLE "GLAccount" DROP CONSTRAINT "GLAccount_userId_fkey";

-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_userId_fkey";

-- DropIndex
DROP INDEX "Bill_userId_idx";

-- DropIndex
DROP INDEX "GLAccount_userId_code_key";

-- DropIndex
DROP INDEX "GLAccount_userId_idx";

-- DropIndex
DROP INDEX "Vendor_userId_idx";

-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "seed",
DROP COLUMN "userId",
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "BillLineItem" DROP COLUMN "seed";

-- AlterTable
ALTER TABLE "GLAccount" DROP COLUMN "seed",
DROP COLUMN "userId",
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "seed";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "seededAt",
DROP COLUMN "showSeed",
ADD COLUMN     "organizationId" TEXT,
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'STAFF';

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "seed",
DROP COLUMN "userId",
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Invitation_email_idx" ON "Invitation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_organizationId_email_key" ON "Invitation"("organizationId", "email");

-- CreateIndex
CREATE INDEX "Bill_organizationId_idx" ON "Bill"("organizationId");

-- CreateIndex
CREATE INDEX "Bill_createdById_idx" ON "Bill"("createdById");

-- CreateIndex
CREATE INDEX "GLAccount_organizationId_idx" ON "GLAccount"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "GLAccount_organizationId_code_key" ON "GLAccount"("organizationId", "code");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "Vendor_organizationId_idx" ON "Vendor"("organizationId");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GLAccount" ADD CONSTRAINT "GLAccount_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
