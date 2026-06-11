import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { IoVolumeMuteSharp, IoVolumeHighSharp } from "react-icons/io5";
import { IoPauseOutline } from "react-icons/io5";
import { CiPlay1 } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa6";
import { IoMdShareAlt } from "react-icons/io";
import ShareModal from "@/components/ShareModal";
import { BASE_URL } from "@/Utils/Constant.js";
import { useNavigate } from "react-router-dom";

// const BASE_URL = "http://localhost:3000/api/v1";

const ReelCard = ({ reel, onOpenComments }) => {
  const videoRef = useRef();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [profileImage, setProfileImage] = useState("");
  const [showShare, setShowShare] = useState(false);

  const commentsCount = reel?.commentsCount || 0;

  const fetchProfile = async (id) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/user/profile/${id}`,
        { withCredentials: true }
      );
      setProfileImage(res.data.user?.profileimage || "");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (reel?.owner?._id) {
      fetchProfile(reel.owner._id);
    }
  }, [reel]);

  useEffect(() => {
    setLikes(reel?.likes?.length || 0);
    setIsLiked(reel?.likes?.includes(user?._id));
  }, [reel, user]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;

        if (entry.isIntersecting) {
          videoRef.current.play();
          setIsPlaying(true);

          axios.post(
            `${BASE_URL}/reels/view/${reel._id}`,
            {},
            { withCredentials: true }
          );
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.7 }
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [reel._id]);

  // ❤️ LIKE
  const handleLike = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/reels/like/${reel._id}`,
        {},
        { withCredentials: true }
      );

      setLikes(res.data.likesCount);
      setIsLiked(res.data.isLiked);
    } catch (err) {
      console.error(err);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <>
      <div style={styles.wrapper}>
        {/* VIDEO */}
        <div style={styles.videoContainer}>
          <video
            ref={videoRef}
            src={reel?.video}
            loop
            muted={isMuted}
            style={styles.video}
          />

          {/* CONTROLS */}
          <div style={styles.topControls}>
            <button onClick={togglePlay} style={styles.controlBtn}>
              {isPlaying ? <IoPauseOutline /> : <CiPlay1 />}
            </button>

            <button onClick={toggleMute} style={styles.controlBtn}>
              {isMuted ? <IoVolumeMuteSharp /> : <IoVolumeHighSharp />}
            </button>
          </div>

          {/* USER */}
          <div style={styles.bottom}>
            <div style={styles.user}>
             <img
  src={
    profileImage ||
    `https://ui-avatars.com/api/?name=${reel?.owner?.username || "User"}`
  }
  style={{
    ...styles.avatar,
    cursor: "pointer",
  }}
  onClick={() => navigate(`/profile/${reel?.owner?._id}`)}
/>
              <span>{reel?.owner?.username}</span>
            </div>

            <p style={styles.caption}>{reel?.caption}</p>
          </div>
        </div>

        {/* ACTIONS */}
        <div style={styles.actionsOutside}>
          <button onClick={handleLike} style={styles.iconBtn}>
            <FaHeart size={26} color={isLiked ? "#ff3040" : "white"} className="cursor-pointer hover:scale-125 transition-transform duration-300" />
          </button>
          <span>{likes}</span>

          <button
            style={styles.iconBtn}
            onClick={() => onOpenComments(reel)}
          >
            <FaRegComment size={24} />
          </button>
          <span>{commentsCount}</span>

          {/* 🔗 SHARE */}
          <button
            style={styles.iconBtn}
            onClick={() => setShowShare(true)}
          >
            <IoMdShareAlt size={24} />
          </button>
        </div>
      </div>

      {/* ✅ SHARE MODAL */}
      {showShare && (
        <ShareModal
          postId={reel._id}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
};

export default ReelCard;

/* =========================
   STYLES
========================= */
const styles = {
  wrapper: {
    height: "100vh",
    width: "100%",
    background: "black",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
  },

  videoContainer: {
    position: "relative",
    width: "100%",
    maxWidth: "400px",
    height: "90%",
  },

  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "10px",
  },

  actionsOutside: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: "90px",
    gap: "14px",
    color: "white",
    height: "100%",
  },

  topControls: {
    position: "absolute",
    top: "10px",
    left: "10px",
    display: "flex",
    gap: "10px",
  },

  bottom: {
    position: "absolute",
    bottom: "10px",
    left: "10px",
    right: "10px",
    color: "white",
  },

  user: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "6px",
  },

  avatar: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    objectFit: "cover",
  },

  caption: {
    fontSize: "14px",
  },

  controlBtn: {
    background: "rgba(0,0,0,0.6)",
    border: "none",
    color: "white",
    padding: "8px",
    borderRadius: "50%",
    cursor: "pointer",
  },

  iconBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "white",
  },
};