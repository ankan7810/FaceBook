import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DOMPurify from "dompurify";
import {
  MessageCircle,
  Share2,
} from "lucide-react";
import { FaRegBookmark } from "react-icons/fa";
import { GoBookmarkSlash } from "react-icons/go";
import CommentSection from "./CommentSection";
import ShareModal from "./ShareModal";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { BASE_URL } from "@/Utils/Constant.js";


const userCache = {};
// const BASE_URL = "http://localhost:3000/api/v1";

const PostCard = ({ post }) => {
  const navigate = useNavigate();


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

  const [profile, setProfile] = useState(null);
  const [timeAgo, setTimeAgo] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [likesCount, setLikesCount] = useState(
    post?.likes?.length || 0
  );
  const [liking, setLiking] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [isSaved, setIsSaved] = useState(
    post?.savedBy?.some(id => id.toString() === user?._id)
  );
  const [saving, setSaving] = useState(false);
  const [isLiked, setIsLiked] = useState(
    post?.likes?.some(id => id.toString() === user?._id)
  );

useEffect(() => {
  setIsSaved(
    post?.savedBy?.some(
      id => id.toString() === user?._id
    ) || false
  );
}, [post, user]);

  const menuRef = useRef();

  useEffect(() => {
    const userId = post?.user?._id;
    if (!userId) return;

    if (userCache[userId]) {
      setProfile(userCache[userId]);
      return;
    }


    const fetchProfile = async () => {
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
        setProfile(formattedUser);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    fetchProfile();
  }, [post?.user?._id]);

  useEffect(() => {
    setLikesCount(post?.likes?.length || 0);
  }, [post]);

  useEffect(() => {
    setIsLiked(
      post?.likes?.some(id => id.toString() === user?._id)
    );
  }, [post, user]);

  const handleLike = async () => {
    if (liking) return;

    try {
      setLiking(true);

      const res = await axios.post(
        `${BASE_URL}/post/like/${post._id}`,
        {},
        { withCredentials: true }
      );

      setLikesCount(res.data.likesCount);

      // 🔥 FIX: don't trust backend, toggle locally
      setIsLiked((prev) => !prev);

    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setLiking(false);
    }
  };

  // 🧼 SANITIZE CAPTION
  const getCaption = (caption) => {
    if (!caption) return "";
    const clean = DOMPurify.sanitize(caption);
    const temp = document.createElement("div");
    temp.innerHTML = clean;
    return temp.innerText.trim();
  };

  const caption = getCaption(post.caption);

  const formatTime = (date) => {
    if (!date) return "";

    const now = new Date();
    const postTime = new Date(date);
    const diff = Math.floor((now - postTime) / 1000);

    if (diff < 10) return "Just now";
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;

    return postTime.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    if (!post?.createdAt) return;

    const update = () => {
      setTimeAgo(formatTime(post.createdAt));
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [post?.createdAt]);

  const profileImage =
    profile?.profileimage ||
    `https://ui-avatars.com/api/?name=${profile?.username || "User"}`;

  const isVideo = (url) => {
    return url?.match(/\.(mp4|webm|ogg)$/i);
  };

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);

      const res = await axios.post(
        `${BASE_URL}/post/save/${post._id}`,
        {},
        { withCredentials: true }
      );

      const saved = res.data.isSaved;
      setIsSaved(saved);

      // ✅ Toast feedback
      if (saved) {
        toast.success("Post saved");
      } else {
        toast.success("Post removed from saved");
      }

    } catch (err) {
      console.error(err);
      toast.error("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      style={{
        ...styles.card,
        background: isDark ? "#242526" : "#fff",
        border: isDark ? "1px solid #3a3b3c" : "1px solid #e4e6eb",
        color: isDark ? "#e4e6eb" : "#000",
        boxShadow: isDark
          ? "0 1px 2px rgba(255,255,255,0.1)"
          : "0 1px 2px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
      }}
    >
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.user}>


          <img
            src={profileImage}
            style={styles.avatar}
            onClick={() => navigate(`/profile/${profile?._id}`)}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${profile?.username}`;
            }}
          />

          <div>
            <div style={styles.username}>
              {profile?.username || "User"}
            </div>
            <div
              style={{
                ...styles.time,
                color: isDark ? "#b0b3b8" : "gray",
              }}
            >
              {timeAgo}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>


          <div
            onClick={handleSave}
            sstyle={{
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: "30px",
              opacity: saving ? 0.5 : 1,
              transition: "transform 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {isSaved ? <GoBookmarkSlash size={20} className="cursor-pointer" /> : <FaRegBookmark size={20} className="cursor-pointer" />}
          </div>
          {/* MENU */}
          <div ref={menuRef} style={{ position: "relative" }}>

            <div
              style={styles.dot}
              onClick={() => setShowMenu((prev) => !prev)}
            >
              ⋯
            </div>

            {showMenu && (
              <div
                style={{
                  ...styles.menu,
                  background: isDark ? "#3a3b3c" : "#fff",
                  border: isDark ? "1px solid #555" : "1px solid #ddd",
                }}
              >
                <div
                  style={styles.menuItem}
                  onClick={() => navigate(`/update-post/${post._id}`)}
                >
                  ✏️ Update
                </div>

                <div
                  style={{ ...styles.menuItem, color: "red" }}
                  onClick={() => navigate(`/delete-post/${post._id}`)}
                >
                  🗑 Delete
                </div>
              </div>
            )}
          </div>

          {showMenu && (
            <div
              style={{
                ...styles.menu,
                background: isDark ? "#3a3b3c" : "#fff",
                border: isDark
                  ? "1px solid #555"
                  : "1px solid #ddd",
              }}
            >
              <div
                style={styles.menuItem}
                onClick={() =>
                  navigate(`/update-post/${post._id}`)
                }
              >
                ✏️ Update
              </div>

              <div
                style={{
                  ...styles.menuItem,
                  color: "red",
                }}
                onClick={() =>
                  navigate(`/delete-post/${post._id}`)
                }
              >
                🗑 Delete
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CAPTION */}
      {caption && <div style={styles.caption}>{caption}</div>}

      {/* MEDIA */}
      {post.media?.length > 0 &&
        (isVideo(post.media[0]) ? (
          <video
            src={post.media[0]}
            style={styles.media}
            controls
          />
        ) : (
          <img src={post.media[0]} style={styles.media} />
        ))}

      {/* COUNTS */}
      <div
        style={{
          ...styles.countRow,
          color: isDark ? "#b0b3b8" : "#65676b",
        }}
      >
        <span>👍 {likesCount}</span>
        <span>{post.commentsCount} comments</span>
      </div>

      {/* ACTIONS */}
      <div
        style={{
          ...styles.actions,
          borderTop: isDark
            ? "1px solid #3a3b3c"
            : "1px solid #e4e6eb",
        }}
      >
        <button
          style={{
            ...styles.btn,
            color: isLiked
              ? "#1877f2"
              : isDark
                ? "#e4e6eb"
                : "#000",
          }}
          onClick={handleLike}
        >
          {isLiked ? (
            <AiFillLike size={20} />
          ) : (
            <AiOutlineLike size={20} />
          )}

          <span>{isLiked ? "Liked" : "Like"}</span>
        </button>

        <button
          style={{
            ...styles.btn,
            color: isDark ? "#e4e6eb" : "#000",
          }}
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle size={18} /> Comment
        </button>

        <button
          style={{
            ...styles.btn,
            color: isDark ? "#e4e6eb" : "#000",
          }}
          onClick={() => setShowShare(true)}
        >
          <Share2 size={18} /> Share
        </button>
      </div>

      {showComments && <CommentSection postId={post._id} />}
      {showShare && (
        <ShareModal
          postId={post._id}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
};

export default PostCard;



const styles = {
  card: {
    background: "#fff",
    padding: "22px",
    borderRadius: "12px",
    border: "1px solid #e4e6eb",
    margin: "26px auto",
    width: "100%",
    maxWidth: "1100px",   // 🔥 ultra-wide
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
  },

  user: {
    display: "flex",
    gap: "10px",
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    objectFit: "cover",
    cursor: "pointer",
  },


  username: {
    fontWeight: "600",
  },

  time: {
    fontSize: "12px",
    color: "gray",
  },

  dot: {
    cursor: "pointer",
    fontSize: "20px",
  },

  menu: {
    position: "absolute",
    top: "30px",
    right: 0,
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    width: "130px",
  },

  menuItem: {
    padding: "10px",
    cursor: "pointer",
  },

  caption: {
    marginTop: "10px",
    display: "-webkit-box",
    WebkitLineClamp: 3,       // 🔥 limit lines
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  media: {
    width: "100%",
    height: "460px",   // 🔥 slightly increased
    objectFit: "cover",
    marginTop: "12px",
    borderRadius: "12px",
  },

  countRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#65676b",
    marginTop: "8px",
  },

  actions: {
    display: "flex",
    justifyContent: "space-around",
    borderTop: "1px solid #e4e6eb",
    marginTop: "10px",
    paddingTop: "8px",
  },

  btn: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
    padding: "8px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    borderRadius: "6px",
    zIndex: 10,              // 🔥 ADD THIS
    position: "relative",    // 🔥 ADD THIS
  },
};
