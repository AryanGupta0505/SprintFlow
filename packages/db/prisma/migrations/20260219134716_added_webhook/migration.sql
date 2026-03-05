/*
  Warnings:

  - Added the required column `webhookUrl` to the `OnRampTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OnRampTransaction" ADD COLUMN     "webhookUrl" TEXT NOT NULL;
