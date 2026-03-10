import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { randomUUID } from "crypto";
import { sendToUser } from "../../../lib/ws";
import { createNotification } from "../../../lib/notificationService";
export async function POST(req: NextRequest) {

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { toUserNumber, amount, note } = await req.json();

  if (!toUserNumber || !amount) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }

  const requesterId = Number(session.user.id);
  const fromUserNumber=await prisma.user.findUnique({
    where:{
        id:requesterId
    }
  })
  const receiver = await prisma.user.findFirst({
    where: {
      number: toUserNumber,
      isDeleted: false
    }
  });

  if (!receiver) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  if (receiver.id === requesterId) {
    return NextResponse.json(
      { error: "Cannot request money from yourself" },
      { status: 400 }
    );
  }

  const request = await prisma.paymentRequest.create({
    data: {
      token: randomUUID(),
      amount,
      note,
      status: "Pending",
      fromUserId: requesterId,   // requester
      toUserId: receiver.id      // payer
    }
  });
  await createNotification({
  userId: receiver.id,
  category: "TRANSACTION",
  event: "PAYMENT_REQUEST_RECEIVED",
  title: "Payment Request",
  message: `You received a payment request`,
  metadata: {
    phone: fromUserNumber?.number,
    amount: amount,
    requestId: request.id
  }
});
  sendToUser(receiver.id, {
  type: "PAYMENT_REQUEST_CREATED",
  data: {
    requestId: request.id,
    amount: request.amount,
    from: requesterId
  }
});
  return NextResponse.json({
    success: true,
    request
  });
}