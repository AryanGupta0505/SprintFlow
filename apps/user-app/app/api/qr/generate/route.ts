import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "@repo/db/client";
import QRCode from "qrcode";
import { number } from "zod";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { number: true }
  });

  const payload = JSON.stringify({
    type: "P2P",
    number: user?.number
  });

  const qrImage = await QRCode.toDataURL(payload);

  return NextResponse.json({ qr: qrImage 
    , number: user?.number
  });
}