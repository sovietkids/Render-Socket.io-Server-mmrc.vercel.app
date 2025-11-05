import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import fs from "fs";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// JSONファイルのパス
const FILE_PATH = "./messages.json";

// ファイルが存在しなければ初期化
if (!fs.existsSync(FILE_PATH)) {
  fs.writeFileSync(FILE_PATH, "[]");
}

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  // 接続時に過去のメッセージを送信
  const history = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));
  socket.emit("chat_history", history);

  // メッセージを受け取る
  socket.on("chat", (msg) => {
    console.log("💬 Message:", msg);

    // ファイルを読み込み
    const messages = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));

    // 新しいメッセージを追加
    const newMessage = {
      id: Date.now(),
      text: msg,
      time: new Date().toISOString(),
    };
    messages.push(newMessage);

    // JSONファイルに保存
    fs.writeFileSync(FILE_PATH, JSON.stringify(messages, null, 2));

    // 全員に配信
    io.emit("chat", newMessage);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Socket.io server running on port ${PORT}`));
