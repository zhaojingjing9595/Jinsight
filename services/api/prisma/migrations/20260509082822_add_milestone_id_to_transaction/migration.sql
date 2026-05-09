-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "milestoneId" TEXT;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "GoalMilestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
