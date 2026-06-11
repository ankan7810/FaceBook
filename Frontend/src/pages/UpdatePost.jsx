import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import DOMPurify from "dompurify";
import { toast } from "react-hot-toast";
import { Bold, Italic, Underline, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { fetchFeed, updatePostInState } from "@/redux/feedSlice";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1";

const UpdatePost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const emojiRef = useRef(null);
  const editorRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);

  // 🔥 NEW: visibility state
  const [visibility, setVisibility] = useState("public");

  // 🔥 GET FEED
  const feed = useSelector((state) => state.feed.feed);

  const post = feed.find((item) => {
    if (item?.data) return item.data._id === postId;
    return item._id === postId;
  });

  useEffect(() => {
    if (!feed.length) {
      dispatch(fetchFeed());
    }
  }, [feed, dispatch]);

  useEffect(() => {
    if (feed.length > 0) setLoading(false);

    if (!post || !editorRef.current) return;

    const caption = post.data?.caption || post.caption || "";
    const vis = post.data?.visibility || post.visibility || "public";

    editorRef.current.innerHTML = DOMPurify.sanitize(caption);

    // 🔥 SET EXISTING VISIBILITY
    setVisibility(vis);

  }, [post, feed]);

  useEffect(() => {
    if (!loading && feed.length > 0 && !post) {
      toast.error("Post not found");
      navigate("/");
    }
  }, [loading, feed, post]);

  // ✨ TEXT FORMAT
  const format = (command) => {
    editorRef.current?.focus();
    document.execCommand(command, false, null);
  };

  // 😊 EMOJI
  const toggleEmoji = (e) => {
    e.stopPropagation();
    setShowEmoji((prev) => !prev);
  };

  const handleEmojiClick = (emojiData) => {
    editorRef.current?.focus();
    document.execCommand("insertText", false, emojiData.emoji);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🚀 UPDATE POST
  const handleUpdate = async () => {
    if (!editorRef.current) return;

    const caption = editorRef.current.innerHTML;

    if (caption.trim() === "") {
      toast.error("Caption cannot be empty");
      return;
    }

    try {
      const res = await axios.put(
        `${BASE_URL}/post/update/${postId}`,
        {
          caption,
          visibility, // 🔥 IMPORTANT
        },
        { withCredentials: true }
      );

      const updatedPost = res.data.post;

      dispatch(updatePostInState(updatedPost));

      toast.success("Post updated successfully ✅");

      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h3 style={styles.heading}>Edit Post</h3>

        {/* TOOLBAR */}
        <div style={styles.toolbar}>
          <ToolbarButton onClick={() => format("bold")}>
            <Bold size={18} />
          </ToolbarButton>

          <ToolbarButton onClick={() => format("italic")}>
            <Italic size={18} />
          </ToolbarButton>

          <ToolbarButton onClick={() => format("underline")}>
            <Underline size={18} />
          </ToolbarButton>

          <ToolbarButton onClick={toggleEmoji}>
            <Smile size={18} />
          </ToolbarButton>
        </div>

        {/* EMOJI PICKER */}
        {showEmoji && (
          <div ref={emojiRef} style={styles.emojiWrapper}>
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        {/* EDITOR */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          style={styles.editor}
        />

        {/* 🔥 VISIBILITY TOGGLE */}
        <div style={styles.visibilityBox}>
          <button
            onClick={() =>
              setVisibility(
                visibility === "public" ? "exclusive" : "public"
              )
            }
            style={{
              ...styles.visibilityBtn,
              background:
                visibility === "exclusive" ? "#ff4d4f" : "#e4e6eb",
              color: visibility === "exclusive" ? "#fff" : "#000",
            }}
          >
            {visibility === "exclusive"
              ? "🔒 Exclusive (Subscribers only)"
              : "🌍 Public (Everyone can see)"}
          </button>
        </div>

        {/* ACTIONS */}
        <div style={styles.actions}>
          <button
            style={styles.cancel}
            onClick={() => navigate("/")}
          >
            Cancel
          </button>

          <button
            style={styles.update}
            onClick={handleUpdate}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePost;

// 🔘 Toolbar Button
const ToolbarButton = ({ children, onClick }) => (
  <button onClick={onClick} style={styles.toolBtn}>
    {children}
  </button>
);

// 🎨 STYLES
const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    padding: "60px 20px",
    background: "#f4f6f8",
    minHeight: "100vh",
  },
  card: {
    width: "100%",
    maxWidth: "720px",
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
  },
  heading: {
    marginBottom: "16px",
  },
  toolbar: {
    display: "flex",
    gap: "8px",
    marginBottom: "10px",
  },
  toolBtn: {
    padding: "8px",
    cursor: "pointer",
  },
  emojiWrapper: {
    marginBottom: "10px",
  },
  editor: {
    minHeight: "140px",
    border: "1px solid #ccc",
    padding: "10px",
    borderRadius: "8px",
  },
  visibilityBox: {
    marginTop: "15px",
  },
  visibilityBtn: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
  cancel: {
    padding: "8px 12px",
  },
  update: {
    padding: "8px 12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  loading: {
    textAlign: "center",
    marginTop: "100px",
  },
};