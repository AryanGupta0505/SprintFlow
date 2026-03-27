import dotenv from "dotenv";
dotenv.config();
import express from "express";
import db from "@repo/db/client";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());

const MAX_PIN_ATTEMPTS = 3;

/* -------------------------------
   🔔 INTERNAL NOTIFY FUNCTION
-------------------------------- */
async function notifyUser(data: any) {
  try {
    await fetch(`${process.env.USER_APP_URL}/api/internal/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.error("Notification failed:", err);
  }
}

/* ------------------------------------------------ */
/* 🟢 ONRAMP MIDDLEWARE */
/* ------------------------------------------------ */

async function onrampbankmiddleware(req: any, res: any, next: any) {
  const { token } = req.body;

  const txn = await db.onRampTransaction.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!txn) {
    return res.status(404).json({
      success: false,
      message: "Invalid token"
    });
  }

  if (txn.status !== "Processing") {
    return res.json({
      success: false,
      message: "Transaction already completed"
    });
  }

  if (!txn.user || txn.user.isDeleted) {
    return res.json({
      success: false,
      message: "User account inactive"
    });
  }

  req.txn = txn;
  next();
}

/* ------------------------------------------------ */
/* 🔵 OFFRAMP MIDDLEWARE */
/* ------------------------------------------------ */

async function offrampbankmiddleware(req: any, res: any, next: any) {
  const { token } = req.body;

  const txn = await db.offRampTransaction.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!txn) {
    return res.status(404).json({
      success: false,
      message: "Invalid token"
    });
  }

  if (txn.status !== "Processing") {
    return res.json({
      success: false,
      message: "Transaction already completed"
    });
  }

  if (!txn.user || txn.user.isDeleted) {
    return res.json({
      success: false,
      message: "User account inactive"
    });
  }

  req.txn = txn;
  next();
}

/* ------------------------------------------------ */
/* 🟢 ONRAMP WEBHOOK */
/* ------------------------------------------------ */

app.post(
  "/onrampbankWebhook",
  onrampbankmiddleware,
  async (req: any, res: any) => {
    const { upiPin } = req.body;
    const txn = req.txn;

    try {
      await db.$transaction(async (tx) => {

        await tx.$queryRaw`
          SELECT * FROM "OnRampTransaction"
          WHERE id = ${txn.id}
          FOR UPDATE
        `;

        const freshTxn = await tx.onRampTransaction.findUnique({
          where: { id: txn.id },
          include: { user: true }
        });

        if (!freshTxn) throw new Error("Transaction not found");
        if (freshTxn.status !== "Processing")
          throw new Error("Transaction already processed");

        if (freshTxn.pinAttempts >= MAX_PIN_ATTEMPTS) {
          await tx.onRampTransaction.update({
            where: { id: freshTxn.id },
            data: { status: "Failure" }
          });

          // 🔔 NOTIFY FAILURE
          await notifyUser({
            userId: freshTxn.userId,
            category: "TRANSACTION",
            event: "TRANSACTION_FAILED",
            title: "Withdrawal Failed",
            message: `Your ₹${freshTxn.amount/100} withdrawal failed`,
            metadata:{
              // token: freshTxn.token,
              amount: freshTxn.amount,
              provider: freshTxn.provider
            }
          });

          throw new Error("Transaction locked (max attempts)");
        }

        if (!freshTxn.user.upiPin || freshTxn.user.upiPin !== upiPin) {
          await tx.onRampTransaction.update({
            where: { id: freshTxn.id },
            data: { pinAttempts: { increment: 1 } }
          });
          throw new Error("Incorrect UPI PIN");
        }

        await tx.$queryRaw`
          SELECT * FROM "Balance"
          WHERE "userId" = ${freshTxn.userId}
          FOR UPDATE
        `;

        let balance = await tx.balance.findUnique({
          where: { userId: freshTxn.userId }
        });

        if (!balance) {
          balance = await tx.balance.create({
            data: {
              userId: freshTxn.userId,
              amount: freshTxn.amount,
              locked: 0
            }
          });
        } else {
          await tx.balance.update({
            where: { userId: freshTxn.userId },
            data: { amount: { increment: freshTxn.amount } }
          });
        }

        await tx.onRampTransaction.update({
          where: { id: freshTxn.id },
          data: {
            status: "Success",
            pinAttempts: 0
          }
        });
      });
      // 🔔 SUCCESS NOTIFICATION
      await notifyUser({
        userId: txn.userId,
        category: "TRANSACTION",
        event: "BANK_WITHDRAWAL_SUCCESS",
        title: "Withdrawal Successful",
        message: `₹${txn.amount} added to your balance`,
        metadata:{
          token: txn.token,
          amount: txn.amount,
          provider: txn.provider
        }
      });

      return res.json({
        success: true,
        message: "Onramp successful"
      });

    } catch (error: any) {
      return res.json({
        success: false,
        message: error.message || "Onramp failed"
      });
    }
  }
);

/* ------------------------------------------------ */
/* 🔵 OFFRAMP WEBHOOK */
/* ------------------------------------------------ */

app.post(
  "/offrampbankWebhook",
  offrampbankmiddleware,
  async (req: any, res: any) => {
    const { upiPin } = req.body;
    const txn = req.txn;

    try {
      await db.$transaction(async (tx) => {

        await tx.$queryRaw`
          SELECT * FROM "OffRampTransaction"
          WHERE id = ${txn.id}
          FOR UPDATE
        `;

        const freshTxn = await tx.offRampTransaction.findUnique({
          where: { id: txn.id },
          include: { user: true }
        });

        if (!freshTxn) throw new Error("Transaction not found");
        if (freshTxn.status !== "Processing")
          throw new Error("Transaction already processed");

        if (freshTxn.pinAttempts >= MAX_PIN_ATTEMPTS) {
          await tx.offRampTransaction.update({
            where: { id: freshTxn.id },
            data: { status: "Failure" }
          });

          await notifyUser({
            userId: freshTxn.userId,
            category: "TRANSACTION",
            event: "TRANSACTION_FAILED",
            title: "Deposit Failed",
            message: `Your ₹${freshTxn.amount/100} deposit failed`,
            metadata:{
              // token: freshTxn.token,
              amount: freshTxn.amount,
              provider: freshTxn.provider
            }
          });

          throw new Error("Transaction locked (max attempts)");
        }

        if (!freshTxn.user.upiPin || freshTxn.user.upiPin !== upiPin) {
          await tx.offRampTransaction.update({
            where: { id: freshTxn.id },
            data: { pinAttempts: { increment: 1 } }
          });
          throw new Error("Incorrect UPI PIN");
        }

        await tx.$queryRaw`
          SELECT * FROM "Balance"
          WHERE "userId" = ${freshTxn.userId}
          FOR UPDATE
        `;

        const balance = await tx.balance.findUnique({
          where: { userId: freshTxn.userId }
        });

        if (!balance || balance.amount < freshTxn.amount) {
          await tx.offRampTransaction.update({
            where: { id: freshTxn.id },
            data: { status: "Failure" }
          });

          await notifyUser({
            userId: freshTxn.userId,
            category: "TRANSACTION",
            event: "TRANSACTION_FAILED",
            title: "Deposit Failed",
            message: `Your ₹${freshTxn.amount/100} deposit failed`,
            metadata:{
              // token: freshTxn.token,
              amount: freshTxn.amount,
              provider: freshTxn.provider
            }
          });

          throw new Error("Insufficient balance");
        }

        await tx.balance.update({
          where: { userId: freshTxn.userId },
          data: { amount: { decrement: freshTxn.amount } }
        });

        await tx.offRampTransaction.update({
          where: { id: freshTxn.id },
          data: {
            status: "Success",
            pinAttempts: 0
          }
        });
      });
      await notifyUser({
        userId: txn.userId,
        category: "TRANSACTION",
        event: "BANK_DEPOSIT_SUCCESS",
        title: "Deposit Successful",
        message: `₹${txn.amount} withdrawn from your balance`,
        metadata:{
          token: txn.token,
          amount: txn.amount,
          provider: txn.provider
        }
      });

      return res.json({
        success: true,
        message: "Offramp successful"
      });

    } catch (error: any) {
      return res.json({
        success: false,
        message: error.message || "Offramp failed"
      });
    }
  }
);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`🏦 Bank webhook server running on port ${PORT}`);
});