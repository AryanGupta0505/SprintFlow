
"use server";

import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";

export async function getAllTransactions() {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  if (!userId) return [];

  const p2p = await prisma.p2pTransfer.findMany({
    where: {
      OR: [
        { fromUserId: userId },
        { toUserId: userId }
      ]
    },
    include: {
      fromUser: {
        select: { number: true, isDeleted: true }
      },
      toUser: {
        select: { number: true, isDeleted: true }
      }
    }
  });

  const onramp = await prisma.onRampTransaction.findMany({
    where: { userId }
  });

  const offramp = await prisma.offRampTransaction.findMany({
    where: { userId }
  });

  const formattedP2P = p2p.map(t => ({
    id: `p2p-${t.id}`,
    source: "p2p",
    direction: t.fromUserId === userId ? "sent" : "received",
    amount: t.amount,
    status: t.status,
    time: t.timestamp,
    description:
      t.fromUserId === userId
        ? `Sent to ${
            t.toUser?.isDeleted ? "Deleted User" : t.toUser?.number
          }`
        : `Received from ${
            t.fromUser?.isDeleted ? "Deleted User" : t.fromUser?.number
          }`,
    token: t.token,
    type: "p2p"
  }));

  const formattedOnRamp = onramp.map(t => ({
    id: `bank-on-${t.id}`,
    source: "bank",
    direction: "received",
    amount: t.amount,
    status: t.status,
    time: t.startTime,
    description: `Withdrawn via ${t.provider}`,
    token: t.token,
    type: "onramp"
  }));

  const formattedOffRamp = offramp.map(t => ({
    id: `bank-off-${t.id}`,
    source: "bank",
    direction: "sent",
    amount: t.amount,
    status: t.status,
    time: t.startTime,
    description: `Deposited via ${t.provider}`,
    token: t.token,
    type: "offramp"
  }));

  return [
    ...formattedP2P,
    ...formattedOnRamp,
    ...formattedOffRamp
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}