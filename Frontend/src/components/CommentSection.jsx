import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { BASE_URL } from "@/Utils/Constant.js";

const userCache = {};

// const BASE_URL = "http://localhost:3000/api/v1";

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [profiles, setProfiles] = useState({});

  const loadComments = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/post/comment/${postId}`,
        { withCredentials: true }
      );

      setComments(res.data.comments || []);
    } catch (err) {
      console.error("Load comments error:", err);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const fetchProfile = async (userId) => {
    if (!userId) return;

    // already cached globally
    if (userCache[userId]) {
      setProfiles((prev) => ({
        ...prev,
        [userId]: userCache[userId],
      }));
      return;
    }

    try {
      const res = await axios.get(
        `${BASE_URL}/user/profile/${userId}`,
        { withCredentials: true }
      );

      const user = res.data.user;

      const formattedUser = {
        ...user,
        profileimage:
          user?.profileimage?.url || user?.profileimage || "",
      };

      userCache[userId] = formattedUser;

      setProfiles((prev) => ({
        ...prev,
        [userId]: formattedUser,
      }));

    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  };

  const extractUsers = (comments) => {
    const ids = new Set();

    const traverse = (list) => {
      list.forEach((c) => {
        if (c.user?._id) ids.add(c.user._id);
        if (c.children?.length) traverse(c.children);
      });
    };

    traverse(comments);
    return Array.from(ids);
  };

  useEffect(() => {
    if (!comments.length) return;

    const ids = extractUsers(comments);
    ids.forEach(fetchProfile);
  }, [comments]);

  const addComment = async (text, parentCommentId = null) => {
    if (!text.trim()) return;

    try {
      await axios.post(
        `${BASE_URL}/post/comment/${postId}`,
        { text, parentCommentId },
        { withCredentials: true }
      );

      setText("");
      loadComments();
    } catch (err) {
      console.error("Add comment error:", err);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await axios.delete(
        `${BASE_URL}/post/comment-del/${commentId}`,
        { withCredentials: true }
      );
      loadComments();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const CommentItem = ({ comment, level = 0 }) => {
    const [replyText, setReplyText] = useState("");
    const [showReply, setShowReply] = useState(false);

    const user = profiles[comment.user?._id];

    const profileImage =
      user?.profileimage ||
      `https://ui-avatars.com/api/?name=${user?.username || "User"}`;

    return (
      <div style={{ marginLeft: level * 20, marginTop: 12 }}>
        <div style={styles.commentRow}>
          {/* ✅ AVATAR */}
          <img
            src={profileImage}
            style={styles.avatar}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${user?.username}`;
            }}
          />

          <div style={styles.content}>
            <div style={styles.topRow}>
              <span style={styles.username}>
                {user?.username || "User"}
              </span>

              <Trash2
                size={14}
                style={styles.deleteIcon}
                onClick={() => handleDelete(comment._id)}
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

            {showReply && (
              <div style={styles.replyBox}>
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={styles.input}
                />
                <button
                  style={styles.postBtn}
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

      <div style={styles.inputWrapper}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={styles.input}
        />
        <button
          style={styles.postBtn}
          onClick={() => addComment(text)}
        >
          Post
        </button>
      </div>

      {comments.map((c) => (
        <CommentItem key={c._id} comment={c} />
      ))}
    </div>
  );
};

export default CommentSection;
const styles = {
  container: {
    marginTop: "15px",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "12px",
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
  },

  postBtn: {
    background: "#2563eb",
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
  },

  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#e5e7eb",
  },

  content: {
    flex: 1,
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
    fontSize: "14px",
    margin: "4px 0",
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
    transition: "0.2s",
  },

  replyBox: {
    display: "flex",
    gap: "6px",
    marginTop: "6px",
  },
};



