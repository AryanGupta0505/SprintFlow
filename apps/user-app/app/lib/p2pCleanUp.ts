import prisma from "@repo/db/client";
import { createNotification } from "./notificationService";
import { sendToUser } from "./ws";

const ONE_MINUTE = 60 * 1000;

export async function cleanupExpiredP2P() {
    console.log("🔥 P2P CLEANUP CALLED");
  const expiryTime = new Date(Date.now() - ONE_MINUTE);

  const expired = await prisma.p2pTransfer.findMany({
    where: {
      status: "Processing",
      timestamp: { lt: expiryTime }
    }
  });

  await prisma.p2pTransfer.updateMany({
    where: {
      status: "Processing",
      timestamp: { lt: expiryTime }
    },
    data: { status: "Failure" }
  });

  for (const tx of expired) {
    console.log("❌ Expiring TX:", tx.id);
    await createNotification({
      userId: tx.fromUserId,
      category: "TRANSACTION",
      event: "TRANSACTION_EXPIRED",
      title: "Transaction Expired",
      message: `Your ₹${tx.amount / 100} transfer expired`,
    });

    // 🔥 REAL-TIME PUSH
    sendToUser(tx.fromUserId, {
      type: "NOTIFICATION",
      data: {
        title: "Transaction Expired",
        message: `Your ₹${tx.amount / 100} transfer expired`
      }
    });
  }
}