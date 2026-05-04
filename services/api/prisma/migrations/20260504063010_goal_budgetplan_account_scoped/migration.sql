/*
  Warnings:

  - You are about to drop the column `userId` on the `Goal` table. All the data in the column will be lost.
  - You are about to drop the `BudgetPlanMember` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `accountId` to the `BudgetPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `Goal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Goal` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BudgetPlanMember" DROP CONSTRAINT "BudgetPlanMember_planId_fkey";

-- DropForeignKey
ALTER TABLE "Goal" DROP CONSTRAINT "Goal_userId_fkey";

-- AlterTable
ALTER TABLE "BudgetPlan" ADD COLUMN     "accountId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Goal" DROP COLUMN "userId",
ADD COLUMN     "accountId" TEXT NOT NULL,
ADD COLUMN     "createdBy" TEXT NOT NULL;

-- DropTable
DROP TABLE "BudgetPlanMember";

-- DropEnum
DROP TYPE "BudgetPlanRole";

-- AddForeignKey
ALTER TABLE "BudgetPlan" ADD CONSTRAINT "BudgetPlan_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
