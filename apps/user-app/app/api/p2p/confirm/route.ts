

import { NextResponse } from "next/server";
import prisma from "@repo/db/client";
import { createNotification } from "../../../lib/notificationService";
import { sendToUser } from "../../../lib/ws";
const ONE_MINUTE = 60 * 1000;

export async function POST(req: Request) {
  const { token, upiPin } = await req.json();

  if (!token || !upiPin) {
    return NextResponse.json({
      success: false,
      message: "Invalid request"
    });
  }

  const transfer = await prisma.p2pTransfer.findUnique({
    where: { token }
  });

  if (!transfer || transfer.status !== "Processing") {
    return NextResponse.json({
      success: false,
      message: "Transaction invalid or already completed"
    });
  }

  const now = Date.now();
  const start = new Date(transfer.timestamp).getTime();

  /* =========================
     ⏳ EXPIRED
  ========================= */

  if (now - start > ONE_MINUTE) {
    await prisma.p2pTransfer.update({
      where: { token },
      data: { status: "Failure" }
    });

    await createNotification({
      userId: transfer.fromUserId,
      category: "TRANSACTION",
      event: "TRANSACTION_EXPIRED",
      title: "Transaction Expired",
      message: `Your ₹${transfer.amount} transfer expired`,
    });

    return NextResponse.json({
      success: false,
      message: "Transaction expired"
    });
  }

  const sender = await prisma.user.findUnique({
    where: { id: transfer.fromUserId }
  });

  const receiver = await prisma.user.findUnique({
    where: { id: transfer.toUserId }
  });

  if (!sender || sender.isDeleted) {
    await prisma.p2pTransfer.update({
      where: { token },
      data: { status: "Failure" }
    });

    return NextResponse.json({
      success: false,
      message: "Sender account inactive"
    });
  }

  if (!receiver || receiver.isDeleted) {
    await prisma.p2pTransfer.update({
      where: { token },
      data: { status: "Failure" }
    });

    return NextResponse.json({
      success: false,
      message: "Receiver account inactive"
    });
  }

  if (!sender.upiPin) {
    return NextResponse.json({
      success: false,
      message: "UPI PIN not set"
    });
  }

  /* =========================
     ❌ WRONG PIN
  ========================= */

  if (sender.upiPin !== upiPin) {
    const newAttempts = transfer.pinAttempts + 1;

    if (newAttempts >= 3) {
      await prisma.p2pTransfer.update({
        where: { token },
        data: {
          pinAttempts: 3,
          status: "Failure"
        }
      });

      await createNotification({
        userId: transfer.fromUserId,
        category: "TRANSACTION",
        event: "TRANSACTION_FAILED",
        title: "Transaction Failed",
        message: `Your ₹${transfer.amount} transfer failed`,
        metadata: {
          phone: receiver.number,
          amount: transfer.amount
        }
      });

      return NextResponse.json({
        success: false,
        message: "Transaction locked (3 failed attempts)"
      });
    }

    await prisma.p2pTransfer.update({
      where: { token },
      data: { pinAttempts: newAttempts }
    });

    return NextResponse.json({
      success: false,
      message: `Incorrect PIN (${newAttempts}/3)`
    });
  }

  /* =========================
     ✅ SUCCESS FLOW
  ========================= */

  try {
    await prisma.$transaction(async (tx) => {

      await tx.$queryRaw`
        SELECT * FROM "Balance"
        WHERE "userId" = ${transfer.fromUserId}
        FOR UPDATE
      `;

      const fromBalance = await tx.balance.findUnique({
        where: { userId: transfer.fromUserId }
      });

      if (!fromBalance) throw new Error("Sender balance not found");
      if (fromBalance.amount < transfer.amount)
        throw new Error("Insufficient funds");

      await tx.$queryRaw`
        SELECT * FROM "Balance"
        WHERE "userId" = ${transfer.toUserId}
        FOR UPDATE
      `;

      let toBalance = await tx.balance.findUnique({
        where: { userId: transfer.toUserId }
      });

      if (!toBalance) {
        toBalance = await tx.balance.create({
          data: {
            userId: transfer.toUserId,
            amount: 0,
            locked: 0
          }
        });
      }

      await tx.balance.update({
        where: { userId: transfer.fromUserId },
        data: { amount: { decrement: transfer.amount } }
      });

      await tx.balance.update({
        where: { userId: transfer.toUserId },
        data: { amount: { increment: transfer.amount } }
      });

      // await tx.p2pTransfer.update({
      //   where: { token },
      //   data: {
      //     status: "Success",
      //     pinAttempts: 0
      //   }
      // });
      const updatedTransfer = await tx.p2pTransfer.update({
        where: { token },
        data: {
          status: "Success",
          pinAttempts: 0
        },
        include: {
          paymentRequest: true
        }
      });
      if (updatedTransfer.paymentRequest) {
        const updatedRequest=await tx.paymentRequest.update({
          where: { id: updatedTransfer.paymentRequest.id },
          data: {
            status: "Accepted",
            transferId: updatedTransfer.id
          }
        });
        await createNotification({
  userId: updatedRequest.fromUserId,
  category: "TRANSACTION",
  event: "PAYMENT_REQUEST_ACCEPTED",
  title: "Payment Request Completed",
  message: "Your payment request was paid",
  metadata: {
    amount: updatedTransfer.amount,
    phone: sender.number,
    requestId: updatedRequest.id
  }
});
        sendToUser(updatedRequest.fromUserId, {
    type: "PAYMENT_REQUEST_UPDATED",
    data: {
      requestId: updatedRequest.id,
      status: "Accepted"
    }
  });
      }
    });

    /* 🔔 SUCCESS NOTIFICATIONS */

    await createNotification({
      userId: transfer.fromUserId,
      category: "TRANSACTION",
      event: "PAYMENT_SENT",
      title: "Payment Sent",
      message: `₹${transfer.amount} sent successfully`,
      metadata: {
        phone: receiver.number,
        direction: "DEBIT",
        amount: transfer.amount,
        token: transfer.token
      }
    });

    await createNotification({
      userId: transfer.toUserId,
      category: "TRANSACTION",
      event: "PAYMENT_RECEIVED",
      title: "Payment Received",
      message: `You received ₹${transfer.amount}`,
      metadata: {
        phone: sender.number,
        direction: "CREDIT",
        amount: transfer.amount,
        token: transfer.token
      }
    });

    /* =======================================================
       🔥 REAL-TIME BALANCE UPDATE (SENDER + RECEIVER)
       ======================================================= */

    const updatedSenderBalance = await prisma.balance.findUnique({
      where: { userId: transfer.fromUserId }
    });

    const updatedReceiverBalance = await prisma.balance.findUnique({
      where: { userId: transfer.toUserId }
    });

    if (updatedSenderBalance) {
      sendToUser(transfer.fromUserId, {
        type: "BALANCE_UPDATE",
        data: {
          amount: updatedSenderBalance.amount,
          locked: updatedSenderBalance.locked
        }
      });
    }

    if (updatedReceiverBalance) {
      sendToUser(transfer.toUserId, {
        type: "BALANCE_UPDATE",
        data: {
          amount: updatedReceiverBalance.amount,
          locked: updatedReceiverBalance.locked
        }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {

    const newAttempts = transfer.pinAttempts + 1;

    if (newAttempts >= 3) {
      await prisma.p2pTransfer.update({
        where: { token },
        data: {
          pinAttempts: 3,
          status: "Failure"
        }
      });

      await createNotification({
        userId: transfer.fromUserId,
        category: "TRANSACTION",
        event: "TRANSACTION_FAILED",
        title: "Transaction Failed",
        message: `Your ₹${transfer.amount} transfer failed`,
        metadata: {
          phone: receiver.number,
          amount: transfer.amount
        }
      });

      return NextResponse.json({
        success: false,
        message: "Transaction failed (3 attempts reached)"
      });
    }

    await prisma.p2pTransfer.update({
      where: { token },
      data: { pinAttempts: newAttempts }
    });

    return NextResponse.json({
      success: false,
      message: error.message || "Transfer failed"
    });
  }
}