import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "@repo/db/client";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { id: Number(session?.user?.id) },
    select: {
      email: true,
      number: true,
      name: true,
      upiPin: true
    }
  });

  return NextResponse.json({ user });
}