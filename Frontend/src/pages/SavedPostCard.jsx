import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1";
const SavedPostCard = ({ post, onUnsave }) => {
  const [loading, setLoading] = useState(false);

  // ✅ Safe profile image handling
  const profileImage =
    post.user?.profileimage?.url ||
    post.user?.profileimage ||
    `https://ui-avatars.com/api/?name=${post.user?.username || "User"}`;

  const handleUnsave = async () => {
    if (loading) return;

    try {
      setLoading(true);

      await axios.post(
        `${BASE_URL}/post/save/${post._id}`,
        {},
        { withCredentials: true }
      );

      // remove from UI
      onUnsave(post._id);

    } catch (error) {
      console.error("Unsave Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      
      {/* USER */}
      <div style={styles.user}>
        <img
          src={profileImage}
          alt="avatar"
          style={styles.avatar}
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${post.user?.username}`;
          }}
        />

        <span style={styles.username}>
          {post.user?.username || "User"}
        </span>

        {/* UNSAVE BUTTON */}
        <button
          style={{
            ...styles.unsaveBtn,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          onClick={handleUnsave}
          disabled={loading}
        >
          {loading ? "..." : "Saved"}
        </button>
      </div>

      {/* CAPTION */}
      {post.caption && (
        <p style={styles.caption}>{post.caption}</p>
      )}

      {/* MEDIA */}
      {post.media?.length > 0 && (
        <img
          src={post.media[0]}
          alt="post"
          style={styles.media}
        />
      )}
    </div>
  );
};

export default SavedPostCard;


const styles = {
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "15px",
    marginBottom: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e4e6eb",
  },

  user: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #ddd",
  },

  username: {
    fontWeight: "600",
    fontSize: "14px",
    color: "#050505",
  },

  caption: {
    marginBottom: "10px",
    fontSize: "14px",
    color: "#333",
    lineHeight: "1.4",
  },

  unsaveBtn: {
  marginLeft: "auto",          // push to right
  background: "#e4e6eb",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "500",
},

  media: {
    width: "100%",
    borderRadius: "8px",
    marginTop: "8px",
    maxHeight: "500px",
    objectFit: "cover",
  },
};