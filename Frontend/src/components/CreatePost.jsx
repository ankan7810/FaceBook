import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { FaVideo, FaImages } from "react-icons/fa";
import { HiOutlineEmojiHappy } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1";
const CreatePost = () => {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [userId, setUserId] = useState(null);
  const [profileImage, setProfileImage] = useState("");

  // ✅ DARK MODE STATE
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const imageRef = useRef();
  const emojiRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/user/profile/${userId}`,
          { withCredentials: true }
        );

        setProfileImage(res.data.user.profileimage);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    fetchProfile();
  }, [userId]);

  // ✅ CLOSE EMOJI ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };

    if (showEmoji) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmoji]);

  const handleSubmit = async () => {
    if (!caption && !file) return;

    try {
      const formData = new FormData();
      formData.append("caption", caption);
      formData.append("type", "image");
      formData.append("media", file);

      await axios.post(
        `${BASE_URL}/post/create`,
        formData,
        { withCredentials: true }
      );

      setCaption("");
      setFile(null);
      setShowEmoji(false);

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <>
      <div
        style={{
          ...styles.card,
          background: isDark ? "#242526" : "#fff",
          color: isDark ? "#e4e6eb" : "#000",
          boxShadow: isDark
            ? "0 1px 3px rgba(255,255,255,0.1)"
            : "0 1px 3px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease",
        }}
      >
        {/* TOP */}
        <div style={styles.top}>
          {!profileImage ? (
            <div
              style={{
                ...styles.avatarSkeleton,
                background: isDark ? "#3a3b3c" : "#ddd",
              }}
            />
          ) : (
            <img
              src={profileImage || "https://via.placeholder.com/40"}
              alt="profile"
              style={styles.avatar}
            />
          )}

          <div
            style={{
              ...styles.inputWrapper,
              background: isDark ? "#3a3b3c" : "#f0f2f5",
            }}
          >
            <input
              type="text"
              placeholder="What's on your mind?"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              style={{
                ...styles.input,
                color: isDark ? "#e4e6eb" : "#000",
              }}
            />

            {/* EMOJI BUTTON */}
            <button
              style={{
                ...styles.emojiBtn,
                background: isDark ? "#4e4f50" : "#e4e6eb",
                color: isDark ? "#fff" : "#000",
              }}
              onClick={() => setShowEmoji((prev) => !prev)}
            >
              <HiOutlineEmojiHappy />
            </button>
          </div>
        </div>

        {/* IMAGE PREVIEW */}
        {file && (
          <div style={styles.previewContainer}>
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              style={styles.preview}
            />
          </div>
        )}

        <div
          style={{
            ...styles.divider,
            background: isDark ? "#3a3b3c" : "#eee",
          }}
        ></div>

        {/* ACTIONS */}
        <div style={styles.actions}>
          <div style={styles.leftActions}>
            <div
              style={{
                ...styles.actionBtn,
                background: isDark ? "#3a3b3c" : "#f0f2f5",
                color: isDark ? "#e4e6eb" : "#000",
              }}
              onClick={() => imageRef.current.click()}
            >
              <FaImages />
              <span>Photo</span>
            </div>

            <div
              style={{
                ...styles.actionBtn,
                background: isDark ? "#3a3b3c" : "#f0f2f5",
                color: isDark ? "#e4e6eb" : "#000",
              }}
              onClick={() => navigate("/upload-video")}
            >
              <FaVideo />
              <span>Video</span>
            </div>
          </div>

          <div
            style={{
              ...styles.postBtn,
              opacity: !caption && !file ? 0.5 : 1,
            }}
            onClick={handleSubmit}
          >
            Post
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          ref={imageRef}
          style={{ display: "none" }}
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>

      {/* EMOJI MODAL */}
      {showEmoji && (
        <div style={styles.overlay}>
          <div
            style={{
              ...styles.emojiBox,
              background: isDark ? "#242526" : "#fff",
            }}
            ref={emojiRef}
          >
            <EmojiPicker
              width="100%"
              height={350}
              onEmojiClick={(emojiData) =>
                setCaption((prev) => prev + emojiData.emoji)
              }
              theme={isDark ? "dark" : "light"}   // 🔥 important
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePost;



const styles = {
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "12px",
    marginBottom: "15px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },

  top: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
  },

  inputWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    background: "#f0f2f5",
    borderRadius: "20px",
    padding: "6px 10px",
  },

  input: {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "14px",
    padding: "8px 10px",   // 🔽 reduced from bulky padding
    height: "34px",
  },

  avatarSkeleton: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#ddd",
  },

  emojiBtn: {
    border: "none",
    background: "#e4e6eb",
    cursor: "pointer",
    fontSize: "18px",
    width: "36px",          // 🔥 same visual height
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  previewContainer: {
    marginTop: "10px",
  },

  preview: {
    width: "100%",
    maxHeight: "250px",
    objectFit: "cover",
    borderRadius: "10px",
  },

  divider: {
    height: "1px",
    background: "#eee",
    margin: "10px 0",
  },

  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  leftActions: {
    display: "flex",
    gap: "12px",
  },

  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    background: "#f0f2f5",
  },

  postBtn: {
    background: "#1877f2",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  // 🔥 OVERLAY (DARK BACKGROUND)
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  // 🔥 EMOJI BOX
  emojiBox: {
    width: "350px",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
    animation: "popup 0.2s ease",
  },
}; 