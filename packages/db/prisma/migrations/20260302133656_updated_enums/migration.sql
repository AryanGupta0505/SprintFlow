/*
  Warnings:

  - The values [WITHDRAWAL_SUCCESS] on the enum `NotificationEvent` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationEvent_new" AS ENUM ('PAYMENT_RECEIVED', 'PAYMENT_SENT', 'BANK_DEPOSIT_SUCCESS', 'BANK_WITHDRAWAL_SUCCESS', 'QR_PAYMENT_SUCCESS', 'TRANSACTION_FAILED', 'TRANSACTION_EXPIRED', 'NEW_LOGIN', 'NEW_DEVICE_LOGIN', 'BALANCE_LOCKED', 'BALANCE_UNLOCKED');
ALTER TABLE "Notification" ALTER COLUMN "event" TYPE "NotificationEvent_new" USING ("event"::text::"NotificationEvent_new");
ALTER TYPE "NotificationEvent" RENAME TO "NotificationEvent_old";
ALTER TYPE "NotificationEvent_new" RENAME TO "NotificationEvent";
DROP TYPE "NotificationEvent_old";
COMMIT;
