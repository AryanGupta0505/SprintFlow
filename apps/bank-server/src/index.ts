import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import db from "@repo/db/client";
const app = express();
app.use(cors());
app.use(express.json());

const ONE_MINUTE = 60 * 1000;

/* -------------------------------
   🔔 INTERNAL NOTIFY FUNCTION
-------------------------------- */
async function notifyUser(data: any) {
  try {
    await fetch(`${process.env.USER_APP_URL}/api/internal/notify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.error("Notification failed:", err);
  }
}

/* =====================================
   CREATE / REUSE ONRAMP TRANSACTION
===================================== */
app.post("/bank/onramptransaction", async (req, res) => {
  const { userId, amount, webhookUrl, provider } = req.body;

  if (!userId || !amount || !webhookUrl) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const user = await db.user.findUnique({
    where: { id: Number(userId) }
  });

  if (!user || user.isDeleted) {
    return res.status(400).json({
      message: "User account inactive"
    });
  }

  const now = new Date();
  const oneMinuteAgo = new Date(Date.now() - ONE_MINUTE);

  const existing = await db.onRampTransaction.findFirst({
    where: {
      userId: Number(userId),
      status: "Processing"
    }
  });

  if (existing) {
    if (existing.startTime > oneMinuteAgo) {
      await db.onRampTransaction.update({
        where: { token: existing.token },
        data: {
          startTime: new Date(),
          amount: Number(amount),
          provider
        }
      });

      return res.json({
        type: "onramp",
        token: existing.token,
        amount: Number(amount),
        redirectUrl: `${process.env.BANK_WEB_URL}/pay/onramp/${existing.token}`
      });
    }

    await db.onRampTransaction.update({
      where: { token: existing.token },
      data: { status: "Failure" }
    });

    // 🔔 Notify expiry of old processing txn
    await notifyUser({
      userId: existing.userId,
      category: "TRANSACTION",
      event: "TRANSACTION_EXPIRED",
      title: "Withdrawal Expired",
      message: `Your ₹${existing.amount} withdrawal expired`,
      metadata:{
        // token: existing.token,
        amount: existing.amount,
        provider: existing.provider
      }
    });
  }

  const token = randomUUID();

  await db.onRampTransaction.create({
    data: {
      token,
      userId: Number(userId),
      amount: Number(amount),
      status: "Processing",
      provider,
      startTime: now,
      webhookUrl
    }
  });

  return res.json({
    type: "onramp",
    token,
    amount: Number(amount),
    redirectUrl: `${process.env.BANK_WEB_URL}/pay/onramp/${token}`
  });
});

/* =====================================
   CREATE / REUSE OFFRAMP TRANSACTION
===================================== */
app.post("/bank/offramptransaction", async (req, res) => {
  const { userId, amount, webhookUrl, provider } = req.body;

  if (!userId || !amount || !webhookUrl) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const user = await db.user.findUnique({
    where: { id: Number(userId) }
  });

  if (!user || user.isDeleted) {
    return res.status(400).json({
      message: "User account inactive"
    });
  }

  const now = new Date();
  const oneMinuteAgo = new Date(Date.now() - ONE_MINUTE);

  const existing = await db.offRampTransaction.findFirst({
    where: {
      userId: Number(userId),
      status: "Processing"
    }
  });

  if (existing) {
    if (existing.startTime > oneMinuteAgo) {
      await db.offRampTransaction.update({
        where: { token: existing.token },
        data: {
          startTime: new Date(),
          amount: Number(amount),
          provider
        }
      });

      return res.json({
        type: "offramp",
        token: existing.token,
        amount: Number(amount),
        redirectUrl: `${process.env.BANK_WEB_URL}/pay/offramp/${existing.token}`
      });
    }

    await db.offRampTransaction.update({
      where: { token: existing.token },
      data: { status: "Failure" }
    });

    // 🔔 Notify expiry
    await notifyUser({
      userId: existing.userId,
      category: "TRANSACTION",
      event: "TRANSACTION_EXPIRED",
      title: "Deposit Expired",
      message: `Your ₹${existing.amount} deposit expired`,
      metadata:{
        // token: existing.token,
        amount: existing.amount,
        provider: existing.provider
      }
    });
  }

  const token = randomUUID();

  await db.offRampTransaction.create({
    data: {
      token,
      userId: Number(userId),
      amount: Number(amount),
      status: "Processing",
      provider,
      startTime: now,
      webhookUrl
    }
  });

  return res.json({
    type: "offramp",
    token,
    amount: Number(amount),
    redirectUrl: `${process.env.BANK_WEB_URL}/pay/offramp/${token}`
  });
});

/* =====================================
   FETCH TRANSACTION (RESTORED)
===================================== */
app.get("/bank/onramptransaction/:token", async (req, res) => {
  const txn = await db.onRampTransaction.findUnique({
    where: { token: req.params.token }
  });

  if (!txn || txn.status !== "Processing") {
    return res.status(404).json({ message: "Transaction expired" });
  }

  res.json({
    amount: txn.amount,
    provider: txn.provider
  });
});

app.get("/bank/offramptransaction/:token", async (req, res) => {
  const txn = await db.offRampTransaction.findUnique({
    where: { token: req.params.token }
  });

  if (!txn || txn.status !== "Processing") {
    return res.status(404).json({ message: "Transaction expired" });
  }

  res.json({
    amount: txn.amount,
    provider: txn.provider
  });
});

/* =====================================
   CLEANUP EXPIRED TRANSACTIONS
===================================== */
const cleanupExpiredTransactions = async () => {
  const expiryTime = new Date(Date.now() - ONE_MINUTE);

  const expiredOnramps = await db.onRampTransaction.findMany({
    where: {
      status: "Processing",
      startTime: { lt: expiryTime }
    }
  });

  const expiredOfframps = await db.offRampTransaction.findMany({
    where: {
      status: "Processing",
      startTime: { lt: expiryTime }
    }
  });

  await db.onRampTransaction.updateMany({
    where: {
      status: "Processing",
      startTime: { lt: expiryTime }
    },
    data: { status: "Failure" }
  });

  await db.offRampTransaction.updateMany({
    where: {
      status: "Processing",
      startTime: { lt: expiryTime }
    },
    data: { status: "Failure" }
  });

  for (const txn of expiredOnramps) {
    await notifyUser({
      userId: txn.userId,
      category: "TRANSACTION",
      event: "TRANSACTION_EXPIRED",
      title: "Withdrawal Expired",
      message: `Your ₹${txn.amount} withdrawal expired`,
      metadata:{
        // token: txn.token,
        amount: txn.amount,
        provider: txn.provider
      }

    });
  }

  for (const txn of expiredOfframps) {
    await notifyUser({
      userId: txn.userId,
      category: "TRANSACTION",
      event: "TRANSACTION_EXPIRED",
      title: "Deposit Expired",
      message: `Your ₹${txn.amount} deposit expired`,
      metadata:{
        // token: txn.token,
        amount: txn.amount,
        provider: txn.provider
      }
    });
  }
};

setInterval(cleanupExpiredTransactions, 10000);
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Dummy Bank running on ${PORT}`);
});