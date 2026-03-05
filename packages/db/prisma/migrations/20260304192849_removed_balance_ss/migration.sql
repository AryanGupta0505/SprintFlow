/*
  Warnings:

  - You are about to drop the `BalanceSnapshot` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BalanceSnapshot" DROP CONSTRAINT "BalanceSnapshot_userId_fkey";

-- DropTable
DROP TABLE "BalanceSnapshot";
