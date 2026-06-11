import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import ReelCard from "./ReelCard";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1";

const CommentItem = React.memo(({ comment, handleReply, userProfiles }) => {
  const [reply, setReply] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const profileImg =
    userProfiles[comment.user?._id] ||
    `https://ui-avatars.com/api/?name=${comment.user?.username}`;

  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={styles.commentItem}>
        <img
          src={profileImg}
          style={styles.avatar}
          loading="lazy"
          alt="profile"
        />

        <div>
          <b>{comment.user?.username}</b>
          <p>{comment.text}</p>

          <span
            style={styles.replyBtn}
            onClick={() => {
              setShowReplyInput((prev) => !prev);
              setShowReplies(true);
            }}
          >
            Reply
          </span>

          {comment.replies?.length > 0 && !showReplies && (
            <div
              style={styles.viewReplies}
              onClick={() => setShowReplies(true)}
            >
              View {comment.replies.length} replies
            </div>
          )}

          {showReplies && comment.replies?.length > 0 && (
            <div
              style={styles.viewReplies}
              onClick={() => setShowReplies(false)}
            >
              Hide replies
            </div>
          )}
        </div>
      </div>

      {showReplyInput && (
        <div style={{ marginLeft: "45px" }}>
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            style={styles.input}
            placeholder="Reply..."
          />
          <button
            onClick={() => {
              handleReply(comment._id, reply);
              setReply("");
              setShowReplyInput(false);
            }}
          >
            Send
          </button>
        </div>
      )}

      {showReplies && (
        <div style={{ marginLeft: "45px" }}>
          {comment.replies?.map((r) => (
            <CommentItem
              key={r._id}
              comment={r}
              handleReply={handleReply}
              userProfiles={userProfiles}
            />
          ))}
        </div>
      )}
    </div>
  );
});

const CommentInput = React.memo(({ text, setText, handleAddComment }) => {
  return (
    <div style={styles.inputBox}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
        style={styles.input}
      />
      <button onClick={handleAddComment}>Send</button>
    </div>
  );
});

const ReelsPage = () => {
  const [reels, setReels] = useState([]);
  const [selectedReel, setSelectedReel] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  const [userProfiles, setUserProfiles] = useState({});

  const buildTree = (comments) => {
    const map = {};
    const roots = [];

    comments.forEach((c) => {
      map[c._id] = { ...c, replies: [] };
    });

    comments.forEach((c) => {
      if (c.parentComment) {
        map[c.parentComment]?.replies.push(map[c._id]);
      } else {
        roots.push(map[c._id]);
      }
    });

    return roots;
  };

  const fetchProfile = async (userId) => {
    try {
      if (userProfiles[userId]) return;

      const res = await axios.get(
        `${BASE_URL}/user/profile/${userId}`,
        { withCredentials: true }
      );

      const user = res.data.user;

      setUserProfiles((prev) => ({
        ...prev,
        [userId]: user?.profileimage || "",
      }));
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  };

  const fetchReels = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/reels/feed`,
        { withCredentials: true }
      );
      setReels(res.data.reels || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async (id) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/reels/comment/${id}`,
        { withCredentials: true }
      );

      const rawComments = res.data.comments || [];

      // FETCH ALL PROFILE IMAGES
      rawComments.forEach((c) => {
        if (c.user?._id) {
          fetchProfile(c.user._id);
        }
      });

      setComments(buildTree(rawComments));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenComments = (reel) => {
    setSelectedReel(reel);
    fetchComments(reel._id);
  };

  const handleAddComment = useCallback(async () => {
    if (!text.trim()) return;

    try {
      const res = await axios.post(
        `${BASE_URL}/reels/comment/${selectedReel._id}`,
        { text },
        { withCredentials: true }
      );

      const newComment = res.data.comment;

      fetchProfile(newComment.user?._id);

      setComments((prev) => [
        { ...newComment, replies: [] },
        ...prev,
      ]);

      setText("");
    } catch (err) {
      console.error(err);
    }
  }, [text, selectedReel]);

  const handleReply = useCallback(async (parentId, replyText) => {
    if (!replyText.trim()) return;

    try {
      const res = await axios.post(
        `${BASE_URL}/reels/comment/${selectedReel._id}`,
        {
          text: replyText,
          parentComment: parentId,
        },
        { withCredentials: true }
      );

      const newReply = res.data.comment;

      fetchProfile(newReply.user?._id);

      const addReply = (comments) =>
        comments.map((c) => {
          if (c._id === parentId) {
            return {
              ...c,
              replies: [newReply, ...(c.replies || [])],
            };
          }
          return {
            ...c,
            replies: addReply(c.replies || []),
          };
        });

      setComments((prev) => addReply(prev));
    } catch (err) {
      console.error(err);
    }
  }, [selectedReel]);

  useEffect(() => {
    fetchReels();
  }, []);

  const scrollDown = () => {
    document
      .getElementById("reels-container")
      ?.scrollBy({ top: window.innerHeight, behavior: "smooth" });
  };

  const scrollUp = () => {
    document
      .getElementById("reels-container")
      ?.scrollBy({ top: -window.innerHeight, behavior: "smooth" });
  };

  return (
    <div style={styles.page}>
      {/* 🎥 REELS */}
      <div id="reels-container" style={styles.reelsContainer}>
        {reels.map((r) => (
          <ReelCard
            key={r._id}
            reel={r}
            onOpenComments={handleOpenComments}
          />
        ))}
      </div>

      {/* 💬 COMMENTS */}
      {selectedReel && (
        <div style={styles.commentPanel}>
          <div style={styles.commentHeader}>
            <span>Comments</span>
            <button onClick={() => setSelectedReel(null)}>✕</button>
          </div>

          <div style={styles.commentList}>
            {comments.map((c) => (
              <CommentItem
                key={c._id}
                comment={c}
                handleReply={handleReply}
                userProfiles={userProfiles}
              />
            ))}
          </div>

          <CommentInput
            text={text}
            setText={setText}
            handleAddComment={handleAddComment}
          />
        </div>
      )}

      {/* NAV */}
      {reels.length > 1 && (
       <div
  style={{
    ...styles.navButtons,
    right: selectedReel ? "380px" : "20px",
  }}
>
  <button style={styles.navBtn} onClick={scrollUp}>
    <FaChevronUp className="cursor-pointer text-white h-7 w-7 hover:scale-125 transition-transform duration-300" />
  </button>

  <div
    style={{
      width: "70%",
      height: "1px",
      background: "#ddd",
    }}
  />

  <button style={styles.navBtn} onClick={scrollDown}>
    <FaChevronDown className="cursor-pointer text-white h-7 w-7 hover:scale-125 transition-transform duration-300" />
  </button>
</div>
      )}
    </div>
  );
};

export default ReelsPage;

const styles = {
  page: {
    position: "relative",
    height: "100vh",
    width: "100%",
    background: "black",
  },
  reelsContainer: {
    height: "100vh",
    overflowY: "scroll",
    scrollSnapType: "y mandatory",
  },
  commentPanel: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "350px",
    height: "100vh",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    zIndex: 1000,
  },
  commentHeader: {
    padding: "10px",
    borderBottom: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
  },
  commentList: {
    flex: 1,
    overflowY: "auto",
    padding: "10px",
  },
  commentItem: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
  },
  avatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  inputBox: {
    display: "flex",
    padding: "10px",
    borderTop: "1px solid #eee",
  },
  input: {
    flex: 1,
    padding: "8px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    marginRight: "10px",
  },
  replyBtn: {
    fontSize: "12px",
    color: "#1877f2",
    cursor: "pointer",
  },
  viewReplies: {
    fontSize: "12px",
    color: "#65676b",
    cursor: "pointer",
  },
  navButtons: {
  position: "fixed",
  right: "20px",
  top: "50%",
  transform: "translateY(-50%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  zIndex: 2000,
},


  // navBtn: {
  //   width: "45px",
  //   height: "45px",
  //   borderRadius: "50%",
  //   border: "none",
  //   background: "rgba(255,255,255,0.9)",
  //   cursor: "pointer",
  // },
  navBtn: {
  width: "40px",
  height: "40px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
},
};
