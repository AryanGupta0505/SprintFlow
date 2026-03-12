
import next from "next";
import http from "http";
import { initWebSocket } from "./app/lib/ws"; // ✅ IMPORTANT: use alias, not relative path

const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
const app = next({
  dev,
  dir: "./apps/user-app"
});
const handle = app.getRequestHandler();

async function startServer() {
  await app.prepare();

  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  // 🔥 Attach WebSocket ONCE
  initWebSocket(server);

const PORT = Number(process.env.PORT) || 3001;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 User-app running on port ${PORT}`);
});
}

startServer();