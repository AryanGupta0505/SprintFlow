
import next from "next";
import http from "http";
import { initWebSocket } from "./app/lib/ws"; // ✅ IMPORTANT: use alias, not relative path

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

async function startServer() {
  await app.prepare();

  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  // 🔥 Attach WebSocket ONCE
  initWebSocket(server);

  // const PORT = 3001;

  server.listen(process.env.PORT, () => {
    console.log(`🚀 User-app running on http://localhost:${process.env.PORT}`);
  });
}

startServer();