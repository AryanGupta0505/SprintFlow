import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import db from "@repo/db/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({
      success: false,
      message: "Unauthorized"
    });
  }

  const { oldPin, newPin } = await req.json();

  if (!/^\d{4}$/.test(newPin)) {
    return NextResponse.json({
      success: false,
      message: "PIN must be 4 digits"
    });
  }

  const user = await db.user.findUnique({
    where: { id: Number(session.user.id) }
  });

  if (!user) {
    return NextResponse.json({
      success: false,
      message: "User not found"
    });
  }

  // 🔐 If PIN exists → validate old PIN
  if (user.upiPin) {
    if (!oldPin) {
      return NextResponse.json({
        success: false,
        message: "Old PIN required"
      });
    }

    if (oldPin !== user.upiPin) {
      return NextResponse.json({
        success: false,
        message: "Old PIN incorrect"
      });
    }
  }

  await db.user.update({
    where: { id: user.id },
    data: { upiPin: newPin }
  });

  return NextResponse.json({
    success: true,
    message: user.upiPin
      ? "UPI PIN updated successfully"
      : "UPI PIN set successfully"
  });
}