import prisma from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  const { enabled, limit } = await req.json(); // limit in rupees

  await prisma.user.update({
    where: { id: userId },
    data: {
      autoReserveEnabled: enabled,
      autoReserveLimit: enabled ? limit * 100 : null
    }
  });

  return NextResponse.json({ success: true });
}