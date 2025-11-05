import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("chat", (msg) => {
    io.emit("chat", msg);
  });
});

server.listen(process.env.PORT || 3001);