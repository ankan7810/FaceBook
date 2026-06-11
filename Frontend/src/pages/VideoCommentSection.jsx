import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1";

const VideoCommentSection = ({ videoId }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  // 🔥 LOAD COMMENTS
  const loadComments = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/video/comments/${videoId}`,
        { withCredentials: true }
      );

      console.log("COMMENTS:", res.data);

      setComments(res.data.comments || []);
    } catch (err) {
      console.error("Load comments error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (videoId) loadComments();
  }, [videoId]);

  // 🔥 ADD COMMENT / REPLY
  const addComment = async (commentText, parentComment = null) => {
    if (!commentText.trim()) return;

    try {
      await axios.post(
        `${BASE_URL}/video/comment/${videoId}`,
        {
          text: commentText,
          parentComment, // 🔥 FIXED (IMPORTANT)
        },
        { withCredentials: true }
      );

      setText("");
      loadComments();
    } catch (err) {
      console.error("Add comment error:", err.response?.data || err.message);
    }
  };

  // 🔥 DELETE COMMENT
  const deleteComment = async (commentId) => {
    try {
      await axios.delete(
        `${BASE_URL}/video/${videoId}/comment/${commentId}`,
        { withCredentials: true }
      );

      loadComments();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
    }
  };

  // 🔥 RECURSIVE COMMENT
  const CommentItem = ({ comment, level = 0 }) => {
    const [replyText, setReplyText] = useState("");
    const [showReply, setShowReply] = useState(false);

    const user = comment.user;

    const profileImage =
      user?.profileimage ||
      `https://ui-avatars.com/api/?name=${user?.username || "User"}`;

    return (
      <div
        style={{
          marginLeft: level * 16,
          borderLeft: level > 0 ? "2px solid #e5e7eb" : "none",
          paddingLeft: level > 0 ? "10px" : "0",
        }}
      >
        <div style={styles.commentRow}>
          <img src={profileImage} style={styles.avatar} />

          <div style={{ flex: 1 }}>
            <div style={styles.topRow}>
              <span style={styles.username}>
                {user?.username || "User"}
              </span>

              <Trash2
                size={14}
                style={styles.deleteIcon}
                onClick={() => deleteComment(comment._id)}
              />
            </div>

            <div style={styles.text}>{comment.text}</div>

            <div style={styles.actions}>
              <span
                style={styles.replyBtn}
                onClick={() => setShowReply(!showReply)}
              >
                Reply
              </span>
            </div>

            {/* REPLY BOX */}
            {showReply && (
              <div style={styles.replyBox}>
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={styles.input}
                  placeholder="Write a reply..."
                />

                <button
                  disabled={!replyText.trim()}
                  style={{
                    ...styles.postBtn,
                    opacity: replyText.trim() ? 1 : 0.5,
                    cursor: replyText.trim() ? "pointer" : "not-allowed",
                  }}
                  onClick={() => {
                    addComment(replyText, comment._id);
                    setReplyText("");
                    setShowReply(false);
                  }}
                >
                  Post
                </button>
              </div>
            )}

            {/* CHILDREN */}
            {comment.children?.map((child) => (
              <CommentItem
                key={child._id}
                comment={child}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>💬 Comments</div>

      {/* INPUT */}
      <div style={styles.inputWrapper}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={styles.input}
          placeholder="Write a comment..."
        />

        <button
          disabled={!text.trim()}
          style={{
            ...styles.postBtn,
            opacity: text.trim() ? 1 : 0.5,
            cursor: text.trim() ? "pointer" : "not-allowed",
          }}
          onClick={() => addComment(text)}
        >
          Post
        </button>
      </div>

      {/* COMMENTS */}
      {comments.length === 0 ? (
        <p style={{ color: "#888", fontSize: "13px" }}>
          No comments yet
        </p>
      ) : (
        comments.map((c) => (
          <CommentItem key={c._id} comment={c} />
        ))
      )}
    </div>
  );
};

export default VideoCommentSection;

const styles = {
  container: {
    marginTop: "15px",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "12px",
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },

  header: {
    fontWeight: "600",
    fontSize: "14px",
    marginBottom: "10px",
  },

  inputWrapper: {
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
  },

  input: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "20px",
    border: "1px solid #e5e7eb",
    outline: "none",
    fontSize: "14px",
    background: "#f0f2f5",
  },

  postBtn: {
    background: "#1877f2",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "13px",
  },

  commentRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "12px",
  },

  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  username: {
    fontWeight: "600",
    fontSize: "13px",
  },

  text: {
    background: "#f0f2f5",
    padding: "8px 12px",
    borderRadius: "12px",
    fontSize: "14px",
    margin: "4px 0",
    display: "inline-block",
  },

  actions: {
    fontSize: "12px",
    color: "#6b7280",
  },

  replyBtn: {
    cursor: "pointer",
  },

  deleteIcon: {
    cursor: "pointer",
    color: "#9ca3af",
  },

  replyBox: {
    display: "flex",
    gap: "6px",
    marginTop: "6px",
  },
};