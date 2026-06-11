// pages/Live.jsx
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

const Live = () => {
  const videoRef = useRef();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    startStream();

    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

  }, []);

  const startStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    videoRef.current.srcObject = stream;
  };

  const sendMessage = (msg) => {
    socket.emit("send-message", {
      streamId: "123",
      message: msg,
      user: "Me"
    });
  };

  return (
    <div style={{ display: "flex" }}>
      <video ref={videoRef} autoPlay muted />

      <div>
        {messages.map((m, i) => (
          <div key={i}>{m.user}: {m.message}</div>
        ))}

        <input onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage(e.target.value);
        }} />
      </div>
    </div>
  );
};

export default Live;