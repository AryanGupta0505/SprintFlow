
import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { sendToUser } from "../../../lib/ws"; // ✅ NEW

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount } = await req.json();

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const unlockAmount = amount * 100;

  const balance = await prisma.balance.findUnique({
    where: { userId }
  });

  if (!balance) {
    return NextResponse.json({ error: "Balance not found" }, { status: 404 });
  }

  if (unlockAmount > balance.locked) {
    return NextResponse.json(
      { error: "Cannot unlock more than locked balance" },
      { status: 400 }
    );
  }

  const updatedBalance = await prisma.balance.update({
    where: { userId },
    data: {
      locked: { decrement: unlockAmount },
      amount: { increment: unlockAmount }
    }
  });

  /* 🔥 REAL-TIME BALANCE UPDATE */
  sendToUser(userId, {
    type: "BALANCE_UPDATE",
    data: {
      amount: updatedBalance.amount,
      locked: updatedBalance.locked
    }
  });

  return NextResponse.json({ success: true });
}