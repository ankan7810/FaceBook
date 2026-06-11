import React, { useEffect, useState } from "react";
import axios from "axios";
import SavedPostCard from "./SavedPostCard";
import { useNavigate } from "react-router-dom";
// import { Navigate } from "react-router-dom";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1";

const SavedPage = () => {
  const [posts, setPosts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");

  // 🔥 FETCH DATA
  const fetchSavedData = async () => {
    try {
      setLoading(true);

      const [postRes, videoRes] = await Promise.all([
        axios.get(`${BASE_URL}/post/saved`, {
          withCredentials: true,
        }),
        axios.get(`${BASE_URL}/video/saved`, {
          withCredentials: true,
        }),
      ]);

      if (postRes.data.success) setPosts(postRes.data.posts);
      if (videoRes.data.success) setVideos(videoRes.data.videos);

    } catch (err) {
      console.error(err);
      setError("Failed to load saved content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedData();
  }, []);

  // 🔥 VIDEO UNSAVE
  const handleVideoUnsave = async (videoId) => {
    try {
      await axios.post(
        `${BASE_URL}/video/save/${videoId}`,
        {},
        { withCredentials: true }
      );

      // remove instantly
      setVideos((prev) => prev.filter((v) => v._id !== videoId));

    } catch (err) {
      console.error("Video Unsave Error:", err);
    }
  };

  if (loading) return <div style={styles.center}>Loading...</div>;
  if (error) return <div style={styles.center}>{error}</div>;

  return (
    <div style={styles.container}>

      {/* LEFT PANEL */}
      <div style={styles.left}>
        <button
          onClick={() => navigate("/")}
          style={styles.backBtn}
        >
          ⬅ Home
        </button>
        <h2 style={styles.title}>Saved</h2>
        <p style={styles.subtitle}>Your saved content</p>

        {/* TABS */}
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tabBtn,
              background: activeTab === "posts" ? "#1877f2" : "#eee",
              color: activeTab === "posts" ? "#fff" : "#000",
            }}
            onClick={() => setActiveTab("posts")}
          >
            Posts
          </button>

          <button
            style={{
              ...styles.tabBtn,
              background: activeTab === "videos" ? "#1877f2" : "#eee",
              color: activeTab === "videos" ? "#fff" : "#000",
            }}
            onClick={() => setActiveTab("videos")}
          >
            Videos
          </button>
        </div>
      </div>

      {/* FEED */}
      <div style={styles.feed}>

        {/* EMPTY */}
        {activeTab === "posts" && posts.length === 0 && (
          <div style={styles.empty}>
            <h3>No saved posts</h3>
          </div>
        )}

        {activeTab === "videos" && videos.length === 0 && (
          <div style={styles.empty}>
            <h3>No saved videos</h3>
          </div>
        )}

        {/* POSTS */}
        {activeTab === "posts" &&
          posts.map((post) => (
            <SavedPostCard
              key={post._id}
              post={post}
              onUnsave={(postId) =>
                setPosts((prev) =>
                  prev.filter((p) => p._id !== postId)
                )
              }
            />
          ))}

        {/* VIDEOS */}
        {activeTab === "videos" &&
          videos.map((video) => (
            <div key={video._id} style={styles.card}>

              {/* 🔥 USER ROW WITH BUTTON */}
              <div style={styles.userRow}>
                <div style={styles.userLeft}>
                  <img
                    src={
                      video.owner?.profileimage?.url ||
                      video.owner?.profileimage ||
                      `https://ui-avatars.com/api/?name=${video.owner?.username}`
                    }
                    style={styles.avatar}
                  />
                  <span style={styles.username}>
                    {video.owner?.username || "User"}
                  </span>
                </div>

                {/* 🔥 SAVE BUTTON (TOP RIGHT) */}
                <button
                  onClick={() => handleVideoUnsave(video._id)}
                  style={styles.saveBtn}
                >
                  Saved
                </button>
              </div>

              {/* TITLE */}
              <div style={styles.caption}>{video.title}</div>

              {/* VIDEO */}
              <div style={styles.videoWrapper}>
                <video
                  src={video.videoFile}
                  controls
                  poster={video.thumbnail}
                  style={styles.video}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default SavedPage;


const styles = {
  container: {
    display: "flex",
    background: "#f0f2f5",
    minHeight: "100vh",
  },

  left: {
    width: "280px",
    padding: "20px",
    borderRight: "1px solid #ddd",
  },

  title: {
    fontSize: "24px",
    fontWeight: "700",
  },

  subtitle: {
    fontSize: "14px",
    color: "gray",
  },

  tabs: {
    marginTop: "20px",
    display: "flex",
    gap: "10px",
  },

  tabBtn: {
    padding: "8px 14px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
  },

  feed: {
    flex: 1,
    maxWidth: "650px",
    margin: "0 auto",
    padding: "20px",
  },

  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "15px",
    marginBottom: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },

  // 🔥 USER ROW
  userRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  userLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
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

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },

  username: {
    fontWeight: "600",
  },

  caption: {
    marginBottom: "10px",
  },

  empty: {
    textAlign: "center",
    marginTop: "50px",
    color: "gray",
  },

  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },

  // 🎥 VIDEO
  videoWrapper: {
    width: "100%",
    aspectRatio: "16/9",
    background: "#000",
    borderRadius: "10px",
    overflow: "hidden",
  },

  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  // 🔥 SAVE BUTTON
  saveBtn: {
    background: "#e4e6eb",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "500",
  },
};