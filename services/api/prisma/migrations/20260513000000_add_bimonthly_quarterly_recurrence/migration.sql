-- Add BIMONTHLY and QUARTERLY, remove CUSTOM from BillRecurrence enum
-- Migrate any existing CUSTOM bills to MONTHLY
UPDATE "Bill" SET "recurrence" = 'MONTHLY' WHERE "recurrence" = 'CUSTOM';

-- Recreate enum without CUSTOM, with new values
ALTER TYPE "BillRecurrence" RENAME TO "BillRecurrence_old";
CREATE TYPE "BillRecurrence" AS ENUM ('MONTHLY', 'BIMONTHLY', 'QUARTERLY', 'ANNUAL', 'WEEKLY');

-- Drop the default before changing the column type
ALTER TABLE "Bill" ALTER COLUMN "recurrence" DROP DEFAULT;
ALTER TABLE "Bill" ALTER COLUMN "recurrence" TYPE "BillRecurrence" USING "recurrence"::text::"BillRecurrence";
ALTER TABLE "Bill" ALTER COLUMN "recurrence" SET DEFAULT 'MONTHLY'::"BillRecurrence";

DROP TYPE "BillRecurrence_old";
