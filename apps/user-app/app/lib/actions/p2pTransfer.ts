
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";
import { randomUUID } from "crypto";
import { cleanupExpiredP2P } from "../p2pCleanUp";
export async function p2pTransfer(to: string, amount: number, requestId?: number) {
  const session = await getServerSession(authOptions);
  const from = Number(session?.user?.id);

  if (!from) return { error: "Unauthorized" };

// ✅ ADD THIS LINE HERE
await cleanupExpiredP2P();
  if (!amount || amount <= 0) {
    return { error: "Invalid amount" };
  }

  const sender = await prisma.user.findUnique({
    where: { id: from }
  });

  if (!sender || sender.isDeleted) {
    return { error: "Account not active" };
  }

  const toUser = await prisma.user.findFirst({
    where: {
      number: to,
      isDeleted: false   // ✅ prevent sending to deleted users
    }
  });

  if (!toUser) return { error: "User not found" };

  if (from === toUser.id)
    return { error: "Cannot transfer to yourself" };

  const transfer = await prisma.p2pTransfer.create({
    data: {
      token: randomUUID(),
      status: "Processing",
      fromUserId: from,
      toUserId: toUser.id,
      amount,
      timestamp: new Date(),
      ...(requestId && {
        paymentRequest: {
          connect: { id: requestId }
        }
      })
    }
  });

  return { token: transfer.token };
}