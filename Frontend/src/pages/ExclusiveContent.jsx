import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1";

const ExclusiveContent = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔥 FETCH POSTS
  const fetchExclusivePosts = async () => {
    const res = await axios.get(
      `${BASE_URL}/post/exclusive/${userId}`,
      { withCredentials: true }
    );
    return res.data.posts;
  };

  // 🔥 FETCH VIDEOS
  const fetchExclusiveVideos = async () => {
    const res = await axios.get(
      `${BASE_URL}/video/exclusive/${userId}`,
      { withCredentials: true }
    );
    return res.data.videos;
  };

  // 🔥 LOAD DATA
  const loadData = async () => {
    try {
      setLoading(true);

      const [postsData, videosData] = await Promise.all([
        fetchExclusivePosts(),
        fetchExclusiveVideos(),
      ]);

      setPosts(postsData || []);
      setVideos(videosData || []);
      setError("");
    } catch (err) {
      console.error(err);

      if (err.response?.status === 403) {
        setError("🔒 You need to subscribe to access this content.");
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  // 🔄 LOADING UI
  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.loader}></div>
        <p>Loading exclusive content...</p>
      </div>
    );
  }

  // ❌ ERROR UI
  if (error) {
    return (
      <div style={styles.center}>
        <h2>{error}</h2>
        <button style={styles.button} onClick={() => navigate(-1)}>
          🔙 Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* 🔥 HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>🔥 Exclusive Content</h1>
        <p style={styles.subtitle}>
          Premium posts & videos from this creator
        </p>
      </div>

      {/* ================= POSTS ================= */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>🖼 Exclusive Posts</h2>

        {posts.length === 0 ? (
          <div style={styles.empty}>No exclusive posts</div>
        ) : (
          posts.map((post) => (
            <div key={post._id} style={styles.card}>
              <p style={styles.caption}>{post.caption}</p>

              {post.media?.[0] && (
                <div style={{ overflow: "hidden", borderRadius: "10px" }}>
                  <img src={post.media[0]} style={styles.image} />
                </div>
              )}
            </div>
          ))
        )}
      </section>

      {/* ================= VIDEOS ================= */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>🎬 Exclusive Videos</h2>

        {videos.length === 0 ? (
          <div style={styles.empty}>No exclusive videos</div>
        ) : (
          <div style={styles.videoGrid}>
            {videos.map((video) => (
              <div key={video._id} style={styles.videoCard}>
                <video
                  controls
                  preload="none"
                  poster={video.thumbnail}
                  style={styles.video}
                >
                  <source src={video.videoFile} type="video/mp4" />
                </video>

                <div style={styles.videoContent}>
                  <h4 style={styles.videoTitle}>{video.title}</h4>
                  <p style={styles.videoDesc}>{video.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ExclusiveContent;

/* ================= STYLES ================= */

const styles = {
  container: {
    padding: "30px 20px",
    maxWidth: "1000px",
    margin: "auto",
    fontFamily: "system-ui, sans-serif",
  },

  header: {
    textAlign: "center",
    marginBottom: "30px",
  },

  title: {
    fontSize: "28px",
    fontWeight: "700",
    background: "linear-gradient(90deg, #ff7a18, #ff3d77)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  subtitle: {
    color: "#777",
    marginTop: "5px",
    fontSize: "14px",
  },

  section: {
    marginBottom: "40px",
  },

  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "15px",
  },

  card: {
    marginBottom: "20px",
    padding: "15px",
    borderRadius: "14px",
    background: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "0.2s",
  },

  caption: {
    marginBottom: "10px",
    fontSize: "15px",
    lineHeight: "1.5",
  },

  image: {
    width: "100%",
    height: "240px",
    objectFit: "cover",
    borderRadius: "10px",
    transition: "0.3s",
  },

  videoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "20px",
  },

  videoCard: {
    background: "#fff",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    transition: "0.2s",
    cursor: "pointer",
  },

  video: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    background: "#000",
  },

  videoContent: {
    padding: "10px",
  },

  videoTitle: {
    fontSize: "15px",
    fontWeight: "600",
    marginBottom: "4px",
  },

  videoDesc: {
    fontSize: "13px",
    color: "#666",
  },

  empty: {
    textAlign: "center",
    padding: "20px",
    color: "#888",
    background: "#f9f9f9",
    borderRadius: "10px",
  },

  center: {
    height: "80vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    color: "#555",
  },

  button: {
    marginTop: "15px",
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(90deg, #1877f2, #4e9af1)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "500",
  },

  loader: {
    width: "40px",
    height: "40px",
    border: "4px solid #eee",
    borderTop: "4px solid #1877f2",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "10px",
  },
};

/* 🔥 Add this globally (important) */
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`, styleSheet.cssRules.length);