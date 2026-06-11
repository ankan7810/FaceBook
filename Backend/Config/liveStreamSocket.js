export const liveStreamSocket = (io) => {
  const users = {}; 

  io.on("connection", (socket) => {
    // console.log("Connected:", socket.id);

    socket.on("join-stream", ({ streamId, userId }) => {
      socket.join(streamId);
      users[socket.id] = userId;

      socket.to(streamId).emit("user-joined", {
        userId,
        socketId: socket.id
      });
    });

    // ✅ ADD HERE (anywhere before disconnect is fine)
    socket.on("end-stream", ({ streamId }) => {
      // console.log("Stream ended:", streamId);

      io.to(streamId).emit("stream-ended");
      socket.leave(streamId);
    });

    socket.on("offer", ({ to, offer }) => {
      io.to(to).emit("offer", {
        offer,
        from: socket.id
      });
    });

    socket.on("answer", ({ to, answer }) => {
      io.to(to).emit("answer", {
        answer,
        from: socket.id
      });
    });

    socket.on("ice-candidate", ({ to, candidate }) => {
      io.to(to).emit("ice-candidate", {
        candidate,
        from: socket.id
      });
    });

    socket.on("send-message", ({ streamId, message, user }) => {
      io.to(streamId).emit("receive-message", {
        message,
        user,
        time: new Date(),
      });
    });

    socket.on("disconnect", () => {
      // console.log("Disconnected:", socket.id);

      const userId = users[socket.id];

      socket.broadcast.emit("user-left", {
        socketId: socket.id,
        userId
      });

      delete users[socket.id];
    });
  });
};