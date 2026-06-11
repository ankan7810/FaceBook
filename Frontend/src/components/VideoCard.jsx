import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchFeed } from "@/redux/feedSlice";
import ConfirmModal from "./ConfirmModal";
import VideoCommentSection from "@/pages/VideoCommentSection";
import { IoShareSocialOutline } from "react-icons/io5";
import { FaRegComment } from "react-icons/fa";
import ShareModal from "./ShareModal";
import { AiOutlineSave, AiFillSave } from "react-icons/ai";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { AiFillLike } from "react-icons/ai";
import { SlLike } from "react-icons/sl";
import { FaRegBookmark } from "react-icons/fa";
import { GoBookmarkSlash } from "react-icons/go";
import { BASE_URL } from "@/Utils/Constant.js";

const userCache = {};

// const BASE_URL = "http://localhost:3000/api/v1";

const VideoCard = ({ video }) => {
  const [profile, setProfile] = useState(null);
  const [timeAgo, setTimeAgo] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likes?.length || 0);
  const [commentCount, setCommentCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(
    video?.likes?.some(id => id.toString() === user?._id)
  );

  const menuRef = useRef();
  const navigate = useNavigate();
  const dispatch = useDispatch();


  useEffect(() => {
    setCommentCount(video.commentsCount || 0);
  }, [video]);

  useEffect(() => {
    if (!video?.savedBy || !user?._id) return;

    setIsSaved(
      video.savedBy.some(id => id.toString() === user._id)
    );
  }, [video?.savedBy, user?._id]);

  useEffect(() => {
    setIsLiked(
      video?.likes?.some(id => id.toString() === user?._id)
    );
  }, [video, user]);

  useEffect(() => {
    const userId = video?.user?._id;
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

        const formatted = {
          ...user,
          profileimage:
            user?.profileimage?.url || user?.profileimage || "",
        };

        userCache[userId] = formatted;
        setProfile(formatted);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, [video?.user?._id]);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/video/comments/${video._id}`,
          { withCredentials: true }
        );
        setCommentCount(res.data.count || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCount();
  }, [video._id]);

  useEffect(() => {
    if (!video?.createdAt) return;

    const now = new Date();
    const postTime = new Date(video.createdAt);
    const diff = Math.floor((now - postTime) / 1000);

    if (diff < 10) setTimeAgo("Just now");
    else if (diff < 60) setTimeAgo(`${diff}s`);
    else if (diff < 3600) setTimeAgo(`${Math.floor(diff / 60)}m`);
    else if (diff < 86400) setTimeAgo(`${Math.floor(diff / 3600)}h`);
    else {
      setTimeAgo(
        postTime.toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    }
  }, [video?.createdAt]);

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

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${BASE_URL}/video/delete/${video._id}`,
        { withCredentials: true }
      );
      setShowDeleteModal(false);
      dispatch(fetchFeed());
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };


  const handleSave = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/video/save/${video._id}`,
        {},
        { withCredentials: true }
      );

      const saved = res.data.isSaved;

      setIsSaved(saved);

      // ✅ Toast messages
      if (saved) {
        toast.success("Video saved");
      } else {
        toast("Video removed from saved");
      }

    } catch (err) {
      console.error(err);
      toast.error("Failed to save video");
    }
  };



  const handleLike = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/video/like/${video._id}`,
        {},
        { withCredentials: true }
      );

      setLikesCount(res.data.likesCount);
      setIsLiked((prev) => !prev);

    } catch (err) {
      console.error(err);
    }
  };

  const profileImage =
    profile?.profileimage ||
    `https://ui-avatars.com/api/?name=${profile?.username || "User"}`;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.user}>
          <img
            src={profileImage}
            style={styles.avatar}
            onClick={() => navigate(`/profile/${video?.user?._id}`)}
          />
          <div>
            <div style={styles.username}>
              {profile?.username || "User"}
            </div>
            <div style={styles.time}>{timeAgo}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

          <div
            onClick={handleSave}
            style={{ cursor: "pointer", fontSize: "20px" }}
          >
            {isSaved ? <GoBookmarkSlash size={20} className="cursor-pointer"/> : <FaRegBookmark size={20} className="cursor-pointer"/>}

          </div>
          <div ref={menuRef} style={{ position: "relative" }}>

            <div
              style={styles.dot}
              onClick={() => setShowMenu((prev) => !prev)}
            >
              ⋯
            </div>

            {showMenu && (
              <div style={styles.menu}>
                <div
                  style={styles.menuItem}
                  onClick={() => {
                    setShowMenu(false);
                    navigate(`/update-video/${video._id}`);
                  }}
                >
                  ✏️ Update
                </div>

                <div
                  style={{ ...styles.menuItem, color: "red" }}
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteModal(true);
                  }}
                >
                  🗑 Delete
                </div>
              </div>
            )}
          </div>

          {showMenu && (
            <div style={styles.menu}>
              <div
                style={styles.menuItem}
                onClick={() => {
                  setShowMenu(false);
                  navigate(`/update-video/${video._id}`);
                }}
              >
                ✏️ Update
              </div>

              <div
                style={{ ...styles.menuItem, color: "red" }}
                onClick={() => {
                  setShowMenu(false);
                  setShowDeleteModal(true);
                }}
              >
                🗑 Delete
              </div>
            </div>
          )}
        </div>
      </div>

      {video.description && (
        <div style={styles.caption}>{video.description}</div>
      )}

      <video
        src={video.videoFile}
        controls
        poster={video.thumbnail}
        style={styles.video}
      />

      <div style={styles.countRow}>
        <span>👍 {likesCount}</span>

        <span onClick={() => setShowComments(true)} style={styles.commentCount}>
          {commentCount} {commentCount === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* ACTION BUTTONS */}
      <div style={styles.actions}>

        <button
          style={{
            ...styles.btn,
            color: isLiked ? "#1877f2" : "#65676b",
          }}
          onClick={handleLike}
        >
          {isLiked ? (
            <AiFillLike size={18} />
          ) : (
            <SlLike size={18} />
          )}
          <span>{isLiked ? "Liked" : "Like"}</span>
        </button>

        <button
          style={styles.btn}
          onClick={() => setShowComments(!showComments)}
        >
          <FaRegComment size={17} className="text-black" />
          <span>Comment</span>
        </button>

        <button
          style={styles.btn}
          onClick={() => setShowShare(true)}
        >
          <IoShareSocialOutline size={20} />
          <span>Share</span>
        </button>
        {showShare && (
          <ShareModal
            postId={video._id}
            onClose={() => setShowShare(false)}
          />
        )}

      </div>

      {/* COMMENT INPUT */}
      {showComments && (
        <VideoCommentSection videoId={video._id} setCommentCount={setCommentCount} />
      )}

      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default VideoCard;

const styles = {
  card: {
    background: "#fff",
    padding: "22px",
    borderRadius: "12px",
    border: "1px solid #e4e6eb",
    margin: "26px auto",
    width: "100%",
    maxWidth: "1100px",
  },

  commentCount: {
    cursor: "pointer",
    fontSize: "14px",
    color: "#65676b",
  },

  commentAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  commentInputRow: {
    display: "flex",
    alignItems: "center", // 🔥 important
    gap: "10px",
  },
  commentItem: {
    display: "flex",
    gap: "8px",
    marginBottom: "10px",
  },

  commentBubble: {
    background: "#f0f2f5",
    padding: "8px 12px",
    borderRadius: "12px",
    fontSize: "14px",
    maxWidth: "400px",
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
    zIndex: 10,
  },
  menuItem: {
    padding: "10px",
    cursor: "pointer",
  },
  caption: {
    marginTop: "10px",
  },

  countRow: {
    marginTop: "10px",
    fontSize: "14px",
    color: "#65676b",

    display: "flex",              // 🔥 this is the key
    alignItems: "center",
    justifyContent: "space-between", // left + right
  },


  actions: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)", // 🔥 equal width
    gap: "100px",
    borderTop: "1px solid #e4e6eb",
    marginTop: "10px",
    paddingTop: "6px",
  },

  btn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",

    padding: "8px 0",
    borderRadius: "6px",
    border: "none",
    background: "transparent",

    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    color: "#65676b",

    transition: "background 0.2s ease",
  },

  commentBox: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },

  commentInput: {
    flex: 1,
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
  },

  video: {
    width: "100%",
    maxHeight: "460px",
    objectFit: "cover",
    marginTop: "12px",
    borderRadius: "12px",
  },
};