// import next from "next";
// import http from "http";
// import { initWebSocket } from "./app/lib/ws";

// const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   const server = http.createServer((req, res) => {
//     handle(req, res);
//   });

//   // 🔥 Attach WebSocket
//   initWebSocket(server);

//   server.listen(3001, () => {
//     console.log("User-app running on http://localhost:3001");
//   });
// });
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

  const PORT = 3001;

  server.listen(PORT, () => {
    console.log(`🚀 User-app running on http://localhost:${PORT}`);
  });
}

startServer();