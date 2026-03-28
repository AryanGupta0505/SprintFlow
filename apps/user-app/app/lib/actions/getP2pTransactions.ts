
"use server";

import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { cleanupExpiredP2P } from "../p2pCleanUp";
export async function getP2PTransactions() {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  if (!userId) return [];

// ✅ ADD THIS LINE
await cleanupExpiredP2P();
  const transactions = await prisma.p2pTransfer.findMany({
    where: {
      OR: [
        { fromUserId: userId },
        { toUserId: userId }
      ]
    },
    include: {
      fromUser: {
        select: { id: true, number: true, isDeleted: true }
      },
      toUser: {
        select: { id: true, number: true, isDeleted: true }
      }
    },
    orderBy: {
      timestamp: "desc"
    }
  });

  return transactions.map(t => ({
    ...t,
    fromUser: t.fromUser?.isDeleted
      ? { number: "Deleted User" }
      : t.fromUser,
    toUser: t.toUser?.isDeleted
      ? { number: "Deleted User" }
      : t.toUser
  }));
}