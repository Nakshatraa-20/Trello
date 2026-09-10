-- DropForeignKey
ALTER TABLE "Boards" DROP CONSTRAINT "Boards_orgId_fkey";

-- AlterTable
ALTER TABLE "Boards" ADD COLUMN     "userId" INTEGER,
ALTER COLUMN "orgId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Boards" ADD CONSTRAINT "Boards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Boards" ADD CONSTRAINT "Boards_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE SET NULL ON UPDATE CASCADE;
