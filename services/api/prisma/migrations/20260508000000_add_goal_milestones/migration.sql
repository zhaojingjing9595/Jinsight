-- Backfill null startDate values from createdAt before making column required
UPDATE "Goal" SET "startDate" = "createdAt" WHERE "startDate" IS NULL;

-- Make startDate non-nullable
ALTER TABLE "Goal" ALTER COLUMN "startDate" SET NOT NULL;

-- Drop savedAmount column
ALTER TABLE "Goal" DROP COLUMN "savedAmount";

-- Create GoalMilestone table
CREATE TABLE "GoalMilestone" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "isAchieved" BOOLEAN NOT NULL DEFAULT false,
    "achievedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalMilestone_pkey" PRIMARY KEY ("id")
);

-- Unique constraint: one row per goal per month
ALTER TABLE "GoalMilestone" ADD CONSTRAINT "GoalMilestone_goalId_year_month_key" UNIQUE ("goalId", "year", "month");

-- Foreign key to Goal with cascade delete
ALTER TABLE "GoalMilestone" ADD CONSTRAINT "GoalMilestone_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
