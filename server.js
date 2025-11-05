import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import fs from "fs";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const FILE_PATH = "./messages.json";
let messages = [];
try {
  if (fs.existsSync(FILE_PATH)) {
    messages = JSON.parse(fs.readFileSync(FILE_PATH, "utf8"));
  }
} catch (err) {
  console.error("⚠️ Failed to read messages.json:", err);
}

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  socket.emit("init", messages);

  socket.on("chat", (msg) => {
    console.log("💬", msg);
    const entry = { text: msg, time: new Date().toISOString() };
    messages.push(entry);
    fs.writeFileSync(FILE_PATH, JSON.stringify(messages, null, 2));
    io.emit("chat", entry);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`🚀 Socket.io server running on ${PORT}`));
