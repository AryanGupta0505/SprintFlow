import prisma from "@repo/db/client";
import { sendToUser } from "./ws";

export async function createNotification({
  userId,
  category,
  event,
  title,
  message,
  metadata
}: {
  userId: number;
  category: "TRANSACTION" | "SECURITY";
  event: any;
  title: string;
  message: string;
  metadata?: any;
}) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      category,
      event,
      title,
      message,
      metadata
    }
  });

  // 🔥 Push real-time
  sendToUser(userId, {
    type: "NEW_NOTIFICATION",
    data: notification
  });

  return notification;
}