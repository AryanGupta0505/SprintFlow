
import { WebSocketServer, WebSocket } from "ws";
import { getToken } from "next-auth/jwt";
import type { IncomingMessage } from "http";
import { parse } from "cookie";

type WSState = {
  wss?: WebSocketServer;
  clients: Map<number, WebSocket>;
};

// 🔥 Persist across HMR reloads
const globalForWS = globalThis as unknown as {
  wsState: WSState;
};

if (!globalForWS.wsState) {
  globalForWS.wsState = {
    clients: new Map(),
  };
}

const state = globalForWS.wsState;

export function initWebSocket(server: any) {
  if (state.wss) {
    return; // Already initialized
  }

  const wss = new WebSocketServer({
    server,
    path: "/ws",
  });

  state.wss = wss;

  wss.on("connection", async (ws: WebSocket, req: IncomingMessage) => {
    console.log("🔌 WS connection attempt");

    try {
      const cookies = req.headers.cookie
        ? parse(req.headers.cookie)
        : {};

      (req as IncomingMessage & { cookies: any }).cookies = cookies;

      // const token = await getToken({
      //   req: req as any,
      //   secret: process.env.NEXTAUTH_SECRET,
      // });
      const url = new URL(req.url || "", `http://${req.headers.host}`);
const userIdFromQuery = url.searchParams.get("token");

let userId: number | null = null;

if (userIdFromQuery) {
  const parsed = Number(userIdFromQuery);
  if (!isNaN(parsed)) {
    userId = parsed;
  }
} else {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token?.sub) {
    userId = Number(token.sub);
  }
}

if (!userId) {
  console.log("❌ WS Auth failed");
  ws.close(1008);
  return;
}
      // if (!token || !token.sub) {
      //   ws.close(1008);
      //   return;
      // }

      // const userId = Number(token.sub);

      (ws as any).userId = userId;
      state.clients.set(userId, ws);

      console.log("✅ WS Authenticated:", userId);

    } catch (err) {
      ws.close(1011);
      return;
    }

    ws.on("close", () => {
      const userId = (ws as any).userId;
      if (userId) {
        state.clients.delete(userId);
        console.log("🔌 WS Disconnected:", userId);
      }
    });
  });
}

export function sendToUser(userId: number, payload: any) {
  console.log("📨 Attempting to send notification");
  console.log("📨 Sending to user:", userId);
console.log("Connected users:", Array.from(state.clients.keys()));

  const ws = state.clients.get(userId);

  if (!ws) {
    console.log("❌ No socket found for user");
    return;
  }

  if (ws.readyState !== WebSocket.OPEN) {
    console.log("❌ Socket not open");
    return;
  }

  ws.send(JSON.stringify(payload));
  console.log("✅ Notification sent");
}