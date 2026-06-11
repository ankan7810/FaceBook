// components/ChatBox.jsx
import { useState, useEffect } from "react";
import { socket } from "./Socket.js";
import { useRef } from "react";
import { useSelector } from "react-redux";


const ChatBox = ({ streamId }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receive-message");
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("send-message", {
      streamId,
      message: text,
      user: user?.username || "Anonymous",
    });

    setText("");
  };

  return (
    <div style={styles.container}>
      <div style={styles.messages}>
        {messages.map((m, i) => (
          <div key={i} style={styles.msg}>
            <b>{m.user}</b>: {m.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputBox}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.btn}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;

const styles = {
  container: {
    width: "300px",
    background: "#ffffff",              // ✅ white background
    display: "flex",
    flexDirection: "column",
    borderLeft: "1px solid #ddd",       // ✅ light border
  },

  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "12px",
    background: "#fafafa",              // ✅ subtle contrast
  },

  msg: {
    marginBottom: "10px",
    fontSize: "14px",
    color: "#222",                      // ✅ dark text
    lineHeight: "1.4",
    wordBreak: "break-word",
  },

  inputBox: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #ddd",
    background: "#fff",
  },

  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",           // ✅ visible input border
    outline: "none",
    fontSize: "14px",
    background: "#fff",
    color: "#000",
  },

  btn: {
    marginLeft: "8px",
    padding: "10px 14px",
    background: "#1877f2",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};