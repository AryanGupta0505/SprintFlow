import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { sendToUser } from "../../../lib/ws";
export async function POST(req: NextRequest) {

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { requestId } = await req.json();

  const userId = Number(session.user.id);

  const request = await prisma.paymentRequest.findUnique({
    where: { id: requestId }
  });

  if (!request) {
    return NextResponse.json(
      { error: "Request not found" },
      { status: 404 }
    );
  }

  if (request.toUserId !== userId) {
    return NextResponse.json(
      { error: "Not authorized" },
      { status: 403 }
    );
  }

  if (request.status !== "Pending") {
    return NextResponse.json(
      { error: "Request already processed" },
      { status: 400 }
    );
  }

  await prisma.paymentRequest.update({
    where: { id: requestId },
    data: {
      status: "Rejected"
    }
  });
  await prisma.paymentRequest.update({
  where: { id: requestId },
  data: { status: "Rejected" }
});

sendToUser(request.fromUserId, {
  type: "PAYMENT_REQUEST_UPDATED",
  data: { requestId }
});

  return NextResponse.json({
    success: true
  });
}