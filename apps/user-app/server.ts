import next from "next";
import http from "http";
import { initWebSocket } from "./app/lib/ws";

const dev = process.env.NODE_ENV !== "production";

const PORT = Number(process.env.PORT) || 3001;

const app = next({
  dev,
  hostname: "0.0.0.0",
  port: PORT,
});

const handle = app.getRequestHandler();

async function startServer() {
  await app.prepare();

  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  // 🔥 Attach WebSocket
  initWebSocket(server);

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 User-app running on port ${PORT}`);
  });
}

startServer();