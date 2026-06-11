import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { socket, connectSocket } from "./Socket.js";
import { createPeerConnection } from "./Peer";
import ChatBox from "./ChatBox";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const LiveRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const peerRef = useRef(null);

  const user = useSelector((state) => state.auth.user);

  const [streamEnded, setStreamEnded] = useState(false);

  useEffect(() => {
    connectSocket();

    console.log("Joining stream:", id);

    socket.emit("join-stream", {
      streamId: id,
      userId: user?._id,
    });

    // =========================
    // RECEIVE OFFER
    // =========================
    socket.on("offer", async ({ offer, from }) => {
      console.log("Offer received");

      const peer = createPeerConnection();
      peerRef.current = peer;

      // RECEIVE VIDEO
      peer.ontrack = (event) => {
        console.log("Receiving video stream");

        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
        }
      };

      await peer.setRemoteDescription(offer);

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("answer", {
        to: from,
        answer,
      });

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice-candidate", {
            to: from,
            candidate: e.candidate,
          });
        }
      };
    });

    // =========================
    // RECEIVE ICE
    // =========================
    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate && peerRef.current) {
        try {
          await peerRef.current.addIceCandidate(candidate);
        } catch (err) {
          console.error("ICE error:", err);
        }
      }
    });

    // =========================
    // 🔥 STREAM ENDED FIX
    // =========================
    socket.on("stream-ended", () => {
      console.log("Stream ended");

      // stop video
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      // close peer
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }

      setStreamEnded(true);

      // optional auto redirect after 3 sec
      setTimeout(() => {
        navigate("/live");
      }, 3000);
    });

    // =========================
    // CLEANUP
    // =========================
    return () => {
      socket.off("offer");
      socket.off("ice-candidate");
      socket.off("stream-ended");

      if (peerRef.current) {
        peerRef.current.close();
      }
    };
  }, [id]);

  return (
    <div style={styles.container}>
      
      {/* VIDEO */}
      <div style={styles.videoSection}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={styles.video}
        />

        {/* 🔥 STREAM ENDED OVERLAY */}
        {streamEnded && (
          <div style={styles.overlay}>
            <h2>⚫ Stream Ended</h2>
            <p>Redirecting...</p>
          </div>
        )}
      </div>

      {/* CHAT */}
      <ChatBox
        streamId={id}
        currentUser={{ username: "Viewer" }}
      />
    </div>
  );
};

export default LiveRoom;

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#ffffff",
  },

  videoSection: {
    flex: 2,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5",
    overflow: "hidden",
    borderRight: "1px solid #ddd",
    position: "relative", // 🔥 required for overlay
  },

  video: {
    width: "90%",
    maxHeight: "80vh",
    borderRadius: "12px",
    background: "#000",
    objectFit: "contain",
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.75)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "20px",
    zIndex: 10,
  },
};