import { io } from "socket.io-client";

// Create a SINGLE shared socket instance
export const socket = io("http://localhost:3000", {
  transports: ["websocket"],     // avoid polling issues
  withCredentials: true,         // needed if using cookies/JWT
  autoConnect: false,            // manual connect control
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const registerBaseEvents = () => {
  socket.on("connect", () => {
    console.log("🟢 Connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔴 Disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Connection error:", err.message);
  });
};

export const joinStream = ({ streamId, userId }) => {
  socket.emit("join-stream", { streamId, userId });
};

// Chat
export const sendMessage = ({ streamId, message, user }) => {
  socket.emit("send-message", { streamId, message, user });
};

export const sendOffer = ({ to, offer }) => {
  socket.emit("offer", { to, offer });
};

export const sendAnswer = ({ to, answer }) => {
  socket.emit("answer", { to, answer });
};

export const sendIceCandidate = ({ to, candidate }) => {
  socket.emit("ice-candidate", { to, candidate });
};