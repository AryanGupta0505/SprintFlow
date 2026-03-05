
import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    /* =========================
       AUTH CHECK
    ========================= */
    const session = await getServerSession(authOptions);
    const userId = Number(session?.user?.id);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    /* =========================
       PASSWORD INPUT CHECK
    ========================= */
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { success: false, message: "Password required" },
        { status: 400 }
      );
    }

    /* =========================
       FETCH USER
    ========================= */
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.isDeleted) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    /* =========================
       PASSWORD VALIDATION
    ========================= */
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Incorrect password" },
        { status: 400 }
      );
    }

    /* =========================
       BALANCE CHECK
    ========================= */
    const balance = await prisma.balance.findUnique({
      where: { userId }
    });

    if (balance && (balance.amount > 0 || balance.locked > 0)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please withdraw all funds before deleting account"
        },
        { status: 400 }
      );
    }

    /* =========================
       SOFT DELETE (CORRECT WAY)
    ========================= */
    await prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {
    console.error("Delete account error:", error);

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}