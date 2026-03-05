
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

  const { amount } = await req.json(); // in rupees

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const lockAmount = amount * 100;

  const balance = await prisma.balance.findUnique({
    where: { userId }
  });

  if (!balance) {
    return NextResponse.json({ error: "Balance not found" }, { status: 404 });
  }

  if (lockAmount > balance.amount) {
    return NextResponse.json(
      { error: "Insufficient available balance" },
      { status: 400 }
    );
  }

  const updatedBalance = await prisma.balance.update({
    where: { userId },
    data: {
      amount: { decrement: lockAmount },
      locked: { increment: lockAmount }
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