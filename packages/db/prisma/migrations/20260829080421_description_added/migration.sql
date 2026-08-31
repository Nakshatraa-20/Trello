/*
  Warnings:

  - A unique constraint covering the columns `[orgId]` on the table `Boards` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `Issue` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "description" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Boards_orgId_key" ON "Boards"("orgId");
