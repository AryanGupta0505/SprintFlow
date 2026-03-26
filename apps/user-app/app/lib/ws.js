const { WebSocketServer, WebSocket } = require("ws");
const { getToken } = require("next-auth/jwt");
const { parse } = require("cookie");

// 🔥 Persist across reloads
const globalForWS = global;

if (!globalForWS.wsState) {
  globalForWS.wsState = {
    clients: new Map(),
  };
}

const state = globalForWS.wsState;

function initWebSocket(server) {
  if (state.wss) return;

  const wss = new WebSocketServer({
    server,
    path: "/ws",
  });

  state.wss = wss;

  wss.on("connection", async (ws, req) => {
    console.log("🔌 WS connection attempt");

    try {
      const cookies = req.headers.cookie
        ? parse(req.headers.cookie)
        : {};

      req.cookies = cookies;

      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const userIdFromQuery = url.searchParams.get("token");

      let userId = null;

      if (userIdFromQuery) {
        const parsed = Number(userIdFromQuery);
        if (!isNaN(parsed)) {
          userId = parsed;
        }
      } else {
        const token = await getToken({
          req,
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

      ws.userId = userId;
      state.clients.set(userId, ws);

      console.log("✅ WS Authenticated:", userId);

    } catch (err) {
      ws.close(1011);
      return;
    }

    ws.on("close", () => {
      const userId = ws.userId;
      if (userId) {
        state.clients.delete(userId);
        console.log("🔌 WS Disconnected:", userId);
      }
    });
  });
}

function sendToUser(userId, payload) {
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

module.exports = {
  initWebSocket,
  sendToUser,
};