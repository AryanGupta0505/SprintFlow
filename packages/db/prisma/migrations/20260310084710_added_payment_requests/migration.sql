-- CreateEnum
CREATE TYPE "PaymentRequestStatus" AS ENUM ('Pending', 'Accepted', 'Rejected', 'Expired');

-- CreateTable
CREATE TABLE "PaymentRequest" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT,
    "status" "PaymentRequestStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "fromUserId" INTEGER NOT NULL,
    "toUserId" INTEGER NOT NULL,
    "transferId" INTEGER,

    CONSTRAINT "PaymentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRequest_token_key" ON "PaymentRequest"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRequest_transferId_key" ON "PaymentRequest"("transferId");

-- CreateIndex
CREATE INDEX "PaymentRequest_toUserId_status_idx" ON "PaymentRequest"("toUserId", "status");

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentRequest" ADD CONSTRAINT "PaymentRequest_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "p2pTransfer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
