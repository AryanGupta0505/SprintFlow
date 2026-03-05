import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "@repo/db/client";
import { NextResponse } from "next/server";

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
    const { name, email, number } = await req.json();

    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    /* ---------------- EMAIL VALIDATION ---------------- */

    let finalEmail = existingUser.email;

    if (!existingUser.email && email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json({
          success: false,
          message: "Email already in use"
        });
      }

      finalEmail = email;
    }

    /* ---------------- PHONE VALIDATION ---------------- */

    let finalNumber = existingUser.number;

    if (!existingUser.number && number) {
      const numberExists = await prisma.user.findUnique({
        where: { number }
      });

      if (numberExists) {
        return NextResponse.json({
          success: false,
          message: "Phone number already in use"
        });
      }

      finalNumber = number;
    }

    /* ---------------- UPDATE USER ---------------- */

    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email: finalEmail,
        number: finalNumber
      }
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully"
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}