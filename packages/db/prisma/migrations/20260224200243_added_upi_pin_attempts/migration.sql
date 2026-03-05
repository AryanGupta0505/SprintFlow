-- AlterTable
ALTER TABLE "OffRampTransaction" ADD COLUMN     "pinAttempts" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "OnRampTransaction" ADD COLUMN     "pinAttempts" INTEGER NOT NULL DEFAULT 0;
