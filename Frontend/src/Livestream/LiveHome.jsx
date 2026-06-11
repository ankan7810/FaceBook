// pages/LiveHome.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LiveHome = () => {
  const [streams, setStreams] = useState([]);
  const navigate = useNavigate();
  // const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    fetchStreams();

    const interval = setInterval(() => {
      fetchStreams();
    }, 3000); // refresh every 3 sec

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStreams((prev) => [...prev]); // forces re-render for time updates
    }, 60000); // every 1 minute

    return () => clearInterval(interval);
  }, []);

  const fetchStreams = async () => {
    try {
      const res = await axios.get("https://facebook-backend-6nqa.onrender.com/api/v1/livestream");
      setStreams(res.data); // already sorted + limited
    } catch (err) {
      console.error(err);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000); // seconds

    if (diff < 60) return `${diff}s ago`;

    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };


  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button
          onClick={() => navigate("/")}
          style={styles.backBtn}
        >
          ⬅ Home
        </button>

        {/* <h2>Live Streams</h2> */}
      </div>

      <button onClick={() => navigate("/go-live")} style={styles.goLive}>
        🔴 Go Live
      </button>

      <div style={styles.grid}>
        {streams.map((s) => (
          <div
            key={s._id}
            style={{
              ...styles.card,
              opacity: s.isLive ? 1 : 0.6,
            }}
            onClick={() => {
              if (!s.isLive) return;   // 🚫 block click
              navigate(`/live/${s._id}`);
            }}
          >
            <div style={{
              ...styles.thumbnail,
              background: s.isLive ? "#000" : "#222"
            }}>
              {s.isLive ? "🔴 LIVE" : "⚫ OFFLINE"}
            </div>

            <h4>{s.title}</h4>

            {!s.isLive && (
              <p style={styles.offlineText}>
                Livestream stopped {getTimeAgo(s.updatedAt || s.createdAt)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveHome;

const styles = {
  container: {
    padding: "30px",
  },
  goLive: {
    marginBottom: "20px",
    padding: "10px 16px",
    background: "red",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, 250px)",
    gap: "20px",
  },
  offlineText: {
    color: "gray",
    fontSize: "12px",
    marginTop: "5px",
  },
  card: {
    background: "#fff",
    padding: "10px",
    borderRadius: "10px",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  thumbnail: {
    height: "120px",
    background: "#000",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
  },

  backBtn: {
    padding: "8px 14px",
    background: "#1877f2",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
