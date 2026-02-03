/*
  Warnings:

  - Added the required column `updatedAt` to the `UserShow` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `UserShow` required. This step will fail if there are existing NULL values in that column.
  - Made the column `showId` on table `UserShow` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "WatchStatus" AS ENUM ('PLANNED', 'WATCHING', 'COMPLETED', 'DROPPED');

-- AlterTable
ALTER TABLE "UserShow" ADD COLUMN     "status" "WatchStatus" NOT NULL DEFAULT 'PLANNED',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "showId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "UserShow_status_idx" ON "UserShow"("status");
