import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "@repo/db/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);
    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        message: "All fields are required"
      });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found"
      });
    }

    /* ---------------- VERIFY OLD PASSWORD ---------------- */

    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
      return NextResponse.json({
        success: false,
        message: "Incorrect old password"
      });
    }

    /* ---------------- HASH NEW PASSWORD ---------------- */

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword
      }
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}