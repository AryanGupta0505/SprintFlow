import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

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
    where: { id: requestId },
    include: {
      fromUser: true
    }
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

  return NextResponse.json({
    success: true,
    number: request.fromUser.number,
    amount: request.amount,
    requestId: request.id
  });
}