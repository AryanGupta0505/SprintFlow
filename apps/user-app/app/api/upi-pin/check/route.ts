import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import db from "@repo/db/client";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ hasPin: false });
  }

  const user = await db.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { upiPin: true }
  });

  return NextResponse.json({
    hasPin: !!user?.upiPin
  });
}