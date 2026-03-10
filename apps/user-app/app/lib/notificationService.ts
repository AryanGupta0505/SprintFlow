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
console.log("CREATED NOTIFICATION", notification.id);
  // 🔥 Push real-time
  sendToUser(userId, {
    type: "NEW_NOTIFICATION",
    data: notification
  });
console.log("WS SENT");
  return notification;
}