import prisma from "@repo/db/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const userId = Number(session.user.id);

  /* =========================
     MARK ALL NOTIFICATIONS
  ========================= */

  if (params.id === "all") {

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json({ success: true });

  }

  /* =========================
     MARK SINGLE NOTIFICATION
  ========================= */

  await prisma.notification.update({
    where: {
      id: Number(params.id),
      userId
    },
    data: {
      isRead: true
    }
  });

  return NextResponse.json({ success: true });

}