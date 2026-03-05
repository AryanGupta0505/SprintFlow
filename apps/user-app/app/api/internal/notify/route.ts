
import { createNotification } from "../../../lib/notificationService";
import { sendToUser } from "../../../lib/ws"; // ✅ IMPORTANT: same relative path

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { userId, category, event, title, message, metadata } = body;

    if (!userId || !category || !event) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🔹 Create notification in DB
    const notification = await createNotification({
      userId,
      category,
      event,
      title,
      message,
      metadata,
    });

    // 🔥 Push via WebSocket immediately
    sendToUser(userId, {
      type: "NEW_NOTIFICATION",
      data: notification,
    });

    return Response.json({ success: true });

  } catch (error) {
    console.error("❌ Internal notify error:", error);

    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}