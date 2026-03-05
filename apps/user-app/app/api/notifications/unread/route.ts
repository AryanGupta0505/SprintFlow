import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth"; // adjust path if needed

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return Response.json({ count: 0 }, { status: 401 });
  }

  const userId = Number(session.user.id);

  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  return Response.json({ count });
}