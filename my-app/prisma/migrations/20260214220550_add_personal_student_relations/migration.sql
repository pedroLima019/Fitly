/*
  Warnings:

  - You are about to drop the column `userId` on the `ClientRequest` table. All the data in the column will be lost.
  - You are about to drop the column `personalId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,personalId]` on the table `ClientRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `personalId` to the `ClientRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `ClientRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ClientRequest" DROP CONSTRAINT "ClientRequest_userId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_personalId_fkey";

-- AlterTable
ALTER TABLE "ClientRequest" DROP COLUMN "userId",
ADD COLUMN     "personalId" TEXT NOT NULL,
ADD COLUMN     "studentId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "personalId";

-- CreateTable
CREATE TABLE "PersonalStudent" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "personalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalStudent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonalStudent_studentId_personalId_key" ON "PersonalStudent"("studentId", "personalId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientRequest_studentId_personalId_key" ON "ClientRequest"("studentId", "personalId");

-- AddForeignKey
ALTER TABLE "ClientRequest" ADD CONSTRAINT "ClientRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRequest" ADD CONSTRAINT "ClientRequest_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalStudent" ADD CONSTRAINT "PersonalStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalStudent" ADD CONSTRAINT "PersonalStudent_personalId_fkey" FOREIGN KEY ("personalId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
