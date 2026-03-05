import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.notification.update({
    where: { id: Number(params.id) },
    data: { isRead: true }
  });

  return Response.json({ success: true });
}