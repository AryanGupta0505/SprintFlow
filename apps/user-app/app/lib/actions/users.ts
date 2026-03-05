
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

export async function getUsers() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return [];
  }

  const currentUserId = Number(session.user.id);

  const users = await prisma.user.findMany({
    where: {
      id: {
        not: currentUserId
      },
      isDeleted: false   // ✅ hide deleted users
    },
    select: {
      id: true,
      name: true,
      number: true,
      email: true
    },
    orderBy: {
      name: "asc"
    }
  });

  return users;
}