
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

export async function getTxn(token: string, type: string) {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  if (!userId) {
    return { error: "Unauthorized" };
  }

  if (type === "p2p") {
    const txn = await prisma.p2pTransfer.findUnique({
      where: { token },
      include: {
        fromUser: {
          select: { number: true, isDeleted: true }
        },
        toUser: {
          select: { number: true, isDeleted: true }
        }
      }
    });

    if (!txn) return null;

    return {
      amount: txn.amount,
      status: txn.status,
      time: txn.timestamp,
      token: txn.token,
      description:
        txn.fromUserId === userId
          ? `Sent to ${
              txn.toUser?.isDeleted ? "Deleted User" : txn.toUser?.number
            }`
          : `Received from ${
              txn.fromUser?.isDeleted ? "Deleted User" : txn.fromUser?.number
            }`
    };
  }

  if (type === "onramp") {
    const txn = await prisma.onRampTransaction.findUnique({
      where: { token }
    });

    if (!txn) return null;

    return {
      amount: txn.amount,
      status: txn.status,
      time: txn.startTime,
      token: txn.token,
      description: `Withdrawn via ${txn.provider}`
    };
  }

  if (type === "offramp") {
    const txn = await prisma.offRampTransaction.findUnique({
      where: { token }
    });

    if (!txn) return null;

    return {
      amount: txn.amount,
      status: txn.status,
      time: txn.startTime,
      token: txn.token,
      description: `Deposited via ${txn.provider}`
    };
  }
}