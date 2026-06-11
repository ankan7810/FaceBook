import { socket, connectSocket } from "./Socket.js";
import { createPeerConnection } from "./Peer";
import { useRef, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ChatBox from "./ChatBox.jsx";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { BASE_URL } from "@/Utils/Constant.js";
const GoLive = () => {
  const videoRef = useRef(null);
  const localStream = useRef(null);

  // 🔥 multi-viewer support
  const peersRef = useRef({});

  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [streamId, setStreamId] = useState(null);
  const [title, setTitle] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    connectSocket();
    startCamera();

    return () => stopCamera();
  }, []);

  // keep video attached after UI switch
  useEffect(() => {
    if (videoRef.current && localStream.current) {
      videoRef.current.srcObject = localStream.current;
    }
  }, [isLive]);

  // =========================
  // CAMERA
  // =========================
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStream.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      toast.error("Camera access denied");
    }
  };

  const stopCamera = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach((t) => t.stop());
    }
  };

  // =========================
  // START LIVE
  // =========================
  const createLive = async () => {
    if (isLive) return;

    if (!title.trim()) {
     toast.error("Enter stream title");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${BASE_URL}/livestream/create`,
        { title },
        { withCredentials: true }
      );

      const id = res.data.stream._id;

      setStreamId(id);
      setIsLive(true);

      socket.emit("join-stream", {
        streamId: id,
        userId: user?._id,
      });
      toast.success("You are now live!");

    } catch (err) {
      console.error(err);
      toast.error("Failed to start stream");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // 🔥 CORE: HANDLE VIEWERS
  // =========================
  useEffect(() => {
    if (!isLive) return;

    // 👀 viewer joined
    socket.on("user-joined", async ({ socketId }) => {
      // console.log("Viewer joined:", socketId);

      const peer = createPeerConnection();
      peersRef.current[socketId] = peer;

      // attach camera stream
      localStream.current.getTracks().forEach((track) => {
        peer.addTrack(track, localStream.current);
      });

      // create offer
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("offer", {
        to: socketId,
        offer,
      });

      // ICE
      peer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice-candidate", {
            to: socketId,
            candidate: e.candidate,
          });
        }
      };
    });

    return () => socket.off("user-joined");
  }, [isLive]);

  // =========================
  // HANDLE ANSWER + ICE
  // =========================
  useEffect(() => {
    socket.on("answer", async ({ from, answer }) => {
      const peer = peersRef.current[from];
      if (peer) {
        await peer.setRemoteDescription(answer);
      }
    });

    socket.on("ice-candidate", async ({ from, candidate }) => {
      const peer = peersRef.current[from];
      if (peer && candidate) {
        await peer.addIceCandidate(candidate);
      }
    });

    return () => {
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(peersRef.current).forEach((peer) => peer.close());
      peersRef.current = {};
    };
  }, []);

  // =========================
  // STOP LIVE
  // =========================
const stopLive = async () => {
  if (!streamId) return;

  try {
    await axios.post(
      `https://facebook-backend-6nqa.onrender.com/api/v1/livestream/end/${streamId}`,
      {},
      { withCredentials: true }
    );

    // 🔥 IMPORTANT: notify viewers
    socket.emit("end-stream", { streamId });

    stopCamera();

    setStreamId(null);
    setIsLive(false);
    setTitle("");

    navigate("/live");

    toast.success("Stream ended successfully");

  } catch (err) {
    console.error(err);
    alert("Failed to stop stream");
  }
};

  // =========================
  // UI
  // =========================
  return (
    <div style={styles.wrapper}>
      {!isLive ? (
        <div style={styles.preLive}>
          <h2>🎥 Go Live</h2>

          <video ref={videoRef} autoPlay muted style={styles.video} />

          <input
            placeholder="Enter stream title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
          />

          <button onClick={createLive} style={styles.startBtn}>
            {loading ? "Starting..." : "🔴 Start Live"}
          </button>
        </div>
      ) : (
        <div style={styles.liveContainer}>
          {/* VIDEO */}
          <div style={styles.videoSection}>
            <video ref={videoRef} autoPlay muted style={styles.videoLive} />

            <button onClick={stopLive} style={styles.stopBtn}>
              ⛔ Stop Live
            </button>
          </div>

          {/* CHAT */}
          <ChatBox streamId={streamId} />
        </div>
      )}
    </div>
  );
};

export default GoLive;


const styles = {
  wrapper: {
    height: "100vh",
    background: "#ffffff",        // ✅ WHITE BACKGROUND
    color: "#000",
    overflow: "hidden",           // ✅ fixed typo
  },

  preLive: {
    maxWidth: "700px",
    margin: "auto",
    padding: "30px",
    textAlign: "center",
  },

  video: {
    width: "100%",
    borderRadius: "12px",
    marginBottom: "20px",
    background: "#000",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    background: "#fff",
    color: "#000",
    outline: "none",
  },

  startBtn: {
    width: "100%",
    padding: "12px",
    background: "red",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  liveContainer: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
  },

  videoSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    overflow: "hidden",           // ✅ stop scroll here
    background: "#f5f5f5",        // ✅ light contrast
    borderRight: "1px solid #ddd",
    position: "relative",
  },

  videoLive: {
    width: "90%",
    maxHeight: "80vh",
    objectFit: "contain",
    borderRadius: "12px",
    background: "#000",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  },

  stopBtn: {
    position: "absolute",         // ✅ fixed typo
    bottom: "15px",
    padding: "10px 20px",
    background: "red",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
