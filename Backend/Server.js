// server/liveStreamServer.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let broadcasters = {}; // streamId -> socketId

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Broadcaster starts stream
  socket.on("start-stream", ({ streamId }) => {
    broadcasters[streamId] = socket.id;
    socket.join(streamId);
    console.log("Stream started:", streamId);
  });

  // Viewer joins
  socket.on("join-stream", ({ streamId }) => {
    socket.join(streamId);

    const broadcasterId = broadcasters[streamId];
    if (broadcasterId) {
      io.to(broadcasterId).emit("viewer-joined", {
        viewerId: socket.id,
      });
    }
  });

  // WebRTC signaling
  socket.on("offer", ({ to, offer }) => {
    io.to(to).emit("offer", {
      from: socket.id,
      offer,
    });
  });

  socket.on("answer", ({ to, answer }) => {
    io.to(to).emit("answer", {
      from: socket.id,
      answer,
    });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", {
      from: socket.id,
      candidate,
    });
  });

  // Chat (optional)
  socket.on("chat-message", ({ streamId, message }) => {
    io.to(streamId).emit("chat-message", {
      user: socket.id,
      message,
    });
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});

server.listen(5001, () => {
  console.log("Live streaming server running on 5001");
});