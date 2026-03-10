import { getServerSession } from "next-auth/next";
import { getUsers } from "../../../app/lib/actions/users";
import { getP2PTransactions } from "../../lib/actions/getP2pTransactions";
import { authOptions } from "../../lib/auth";
import prisma from "@repo/db/client";
import PageClient from "./PageClient";

export const dynamic = "force-dynamic"; // ✅ disable cache

const ONE_MINUTE = 60 * 1000;

export default async function Page() {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  /* =========================
     AUTO MARK EXPIRED
  ========================= */
  await prisma.p2pTransfer.updateMany({
    where: {
      status: "Processing",
      timestamp: {
        lt: new Date(Date.now() - ONE_MINUTE)
      }
    },
    data: {
      status: "Failure"
    }
  });

  
  const users = await getUsers();
  const transactions = await getP2PTransactions();

  return (
    <PageClient
      users={users}
      transactions={transactions}
      userId={userId}
    />
  );
}