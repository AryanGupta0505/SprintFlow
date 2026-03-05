-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('TRANSACTION', 'SECURITY');

-- CreateEnum
CREATE TYPE "NotificationEvent" AS ENUM ('PAYMENT_RECEIVED', 'PAYMENT_SENT', 'BANK_DEPOSIT_SUCCESS', 'WITHDRAWAL_SUCCESS', 'QR_PAYMENT_SUCCESS', 'TRANSACTION_FAILED', 'TRANSACTION_EXPIRED', 'NEW_LOGIN', 'NEW_DEVICE_LOGIN', 'BALANCE_LOCKED', 'BALANCE_UNLOCKED');

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "category" "NotificationCategory" NOT NULL,
    "event" "NotificationEvent" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
