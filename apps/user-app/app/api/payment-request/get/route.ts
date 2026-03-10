import { NextResponse } from "next/server";
import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

export async function GET() {

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = Number(session.user.id);

  /* =========================
     INCOMING
     Someone requested money from me
  ========================= */

  const incoming = await prisma.paymentRequest.findMany({
    where: {
      toUserId: userId
    },
    include: {
      fromUser: {
        select: {
          name: true,
          number: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  /* =========================
     OUTGOING
     I requested money from someone
  ========================= */

  const outgoing = await prisma.paymentRequest.findMany({
    where: {
      fromUserId: userId
    },
    include: {
      toUser: {
        select: {
          name: true,
          number: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return NextResponse.json({
    incoming,
    outgoing
  });
}