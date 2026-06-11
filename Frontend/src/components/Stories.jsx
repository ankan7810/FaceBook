import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { IoPauseOutline } from "react-icons/io5";
import { CiPlay1 } from "react-icons/ci";
import { FaChevronLeft } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa";
import { LuTrash } from "react-icons/lu";
import { FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import { IoVolumeMuteSharp } from "react-icons/io5";
import { IoVolumeHighSharp } from "react-icons/io5";
import ProfileAvatar from "./ProfileAvatarPage ";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1";

const Stories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useRef(null);
  const videoRef = useRef(null);

  const [groups, setGroups] = useState([]);
  const [active, setActive] = useState(null);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [myProfile, setMyProfile] = useState(null);

  useEffect(() => {
    fetchStories();
  }, [location.pathname]);

  useEffect(() => {
    setIsMuted(true);
  }, [index]);

  useEffect(() => {
    if (!groups.length) return;

    const fetchMyProfile = async () => {
      try {
        const myId =
          groups.find((g) => g.isMyStory)?.user?._id ||
          groups[0]?.user?._id;

        if (!myId) return;

        const res = await axios.get(
          `${BASE_URL}/user/profile/${myId}`,
          { withCredentials: true }
        );

        const user = res.data.user;

        setMyProfile({
          ...user,
          profileimage: user?.profileimage || "",
        });
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    fetchMyProfile();
  }, [groups]);


  const handlePause = () => {
    setIsPaused(true);
    if (videoRef.current) videoRef.current.pause();
  };

  const handlePlay = () => {
    setIsPaused(false);
    if (videoRef.current) videoRef.current.play().catch(() => { });
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPaused) video.pause();
    else video.play().catch(() => { });
  }, [isPaused]);


  const toggleLike = async (storyId) => {
    try {
      const video = videoRef.current;
      const currentTime = video ? video.currentTime : 0;

      const res = await axios.post(
        `${BASE_URL}/strory/like/${storyId}`,
        {},
        { withCredentials: true }
      );

      setActive((prev) => {
        const updatedStories = prev.stories.map((s, i) => {
          if (i !== index) return s;

          const alreadyLiked = s.likes.includes(res.data.userId);

          return {
            ...s,
            likes: alreadyLiked
              ? s.likes.filter((id) => id !== res.data.userId)
              : [...s.likes, res.data.userId],
          };
        });

        return { ...prev, stories: updatedStories };
      });

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = currentTime;
        }
      }, 0);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStories = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/strory/feed`,
        { withCredentials: true }
      );
      setGroups(res.data?.stories || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!active || isPaused) return;

    const currentStory = active.stories[index];

    if (currentStory?.type === "image") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            nextStory();
            return 0;
          }
          return prev + 1;
        });
      }, 40);

      return () => clearInterval(interval);
    }
  }, [active, index, isPaused]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      if (!isPaused) {
        video.play().catch(() => { });
      }
    }
  }, [index]);

  const nextStory = () => {
    if (!active) return;

    if (index < active.stories.length - 1) {
      setIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      setActive(null);
      setIndex(0);
      setProgress(0);
    }
  };

  const prevStory = () => {
    if (!active) return;

    if (index > 0) {
      setIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const deleteStory = async (storyId) => {
    try {
      await axios.delete(
        `${BASE_URL}/strory/delete/${storyId}`,
        { withCredentials: true }
      );

      let updatedActiveStories = active.stories.filter(
        (s) => s._id !== storyId
      );

      if (updatedActiveStories.length === 0) {
        setActive(null);
      } else {
        setActive({
          ...active,
          stories: updatedActiveStories,
        });
        setIndex(0);
        setProgress(0);
      }

      setGroups((prevGroups) =>
        prevGroups
          .map((g) => {
            if (g._id !== active._id) return g;

            const newStories = g.stories.filter(
              (s) => s._id !== storyId
            );

            if (newStories.length === 0) return null;

            return { ...g, stories: newStories };
          })
          .filter(Boolean)
      );

      setShowConfirm(false);
      setShowMenu(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div style={styles.wrapper} ref={scrollRef}>
        <div
          style={styles.createCard}
          onClick={() => navigate("/create-story")}
        >
          <img
            src={
              myProfile?.profileimage ||
              `https://ui-avatars.com/api/?name=${myProfile?.username || "User"}&rounded=true`
            }
            style={{
              ...viewer.profileAvatar,
            }}
          />

          {/* <ProfileAvatar userId={active?.user?._id} size={35} /> */}

          <div style={styles.plusWrapper}>+</div>
          <div style={styles.createText}>Create story</div>
        </div>

        {groups.map((g) => (
          <div
            key={g._id}
            style={styles.card}
            onClick={() => {
              setActive(g);
              setIndex(0);
              setProgress(0);
            }}
          >
            <img
              src={
                g.stories?.[0]?.thumbnail ||
                g.stories?.[0]?.media
              }
              style={styles.img}
            />
            <span style={styles.username}>{g.user.username}</span>
          </div>
        ))}
      </div>

      {/*  VIEWER  */}
      {active && (
        <div style={viewer.overlay}>
          <div style={viewer.container}>

            {/* ===== TAP NAVIGATION ===== */}
            <div style={viewer.tapArea}>
              <div
                style={viewer.leftTap}
                onClick={prevStory}
                onMouseDown={handlePause}
                onMouseUp={handlePlay}
                onTouchStart={handlePause}
                onTouchEnd={handlePlay}
              ></div>

              <div
                style={viewer.rightTap}
                onClick={nextStory}
                onMouseDown={handlePause}
                onMouseUp={handlePlay}
                onTouchStart={handlePause}
                onTouchEnd={handlePlay}
              ></div>
            </div>

            {/* ===== SIDE ICONS ===== */}
            <div style={viewer.sideNav} >

              {/* LEFT ICON */}
              {index > 0 && (
                <button style={viewer.sideBtnLeft} onClick={prevStory}>
                  <FaChevronLeft />
                </button>
              )}

              {/* RIGHT ICON */}
              {active?.stories?.length > 1 &&
                index < active.stories.length - 1 && (
                  <button style={viewer.sideBtnRight} onClick={nextStory}>
                    <FaAngleRight />
                  </button>
                )
              }

            </div>

            {/* ===== PROGRESS BAR ===== */}
            <div style={viewer.progressWrap}>
              {active.stories.map((_, i) => (
                <div key={i} style={viewer.barContainer}>
                  <div
                    style={{
                      ...viewer.barFill,
                      width:
                        i < index
                          ? "100%"
                          : i === index
                            ? `${progress}%`
                            : "0%",
                    }}
                  />
                </div>
              ))}
            </div>
            {/* ===== TOP CONTROLS ===== */}
            <div style={viewer.topBar}>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexDirection: "row",   // 🔥 enforce left → right
                }}
              >

                {/* 👤 Avatar FIRST (extreme left) */}
                <div style={styles.avatarWrapper} className="mt-4">
                  <img
                    src={
                      myProfile?.profileimage &&
                        myProfile.profileimage.trim() !== ""
                        ? myProfile.profileimage
                        : `https://ui-avatars.com/api/?name=${myProfile?.username || "User"}&background=random&rounded=true`
                    }
                    style={styles.profileAvatar}

                  />
                </div>

                {/* ▶️ Play/Pause SECOND */}
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  style={viewer.iconBtn}
                  className="mt-4 "
                >
                  {isPaused ? <CiPlay1 size={18} /> : <IoPauseOutline size={18} />}
                </button>

              </div>




              {/* RIGHT: Heart + Menu */}
              <div style={viewer.rightControls} >

                {/* 🔊 MUTE */}
                {active.stories[index]?.type === "video" && (
                  <button
                    onClick={() => setIsMuted((prev) => !prev)}
                    style={viewer.iconBtn}
                    className="mt-4"
                  >
                    {isMuted ? <IoVolumeMuteSharp /> : <IoVolumeHighSharp />}
                  </button>
                )}

                {/* ❤️ HEART */}
                <button
                  onClick={() => toggleLike(active.stories[index]._id)}
                  style={viewer.iconBtn}
                  className="mt-4"
                >
                  {active.stories[index].likes?.includes(active.user?._id) ? (
                    <FaHeart style={{ color: "red" }} />
                  ) : (
                    <FaRegHeart />
                  )}
                </button>

                {/* ⋯ MENU */}
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  style={viewer.iconBtn}
                  className="mt-4"
                >
                  ⋯
                </button>

              </div>

            </div>

            {/* ===== MENU ===== */}
            {showMenu && (
              <div style={viewer.menu}>
                <button

                  style={viewer.menuItem}
                  onClick={() => {
                    setShowMenu(false);
                    setShowConfirm(true);
                  }}
                >
                  <LuTrash />
                </button>
              </div>
            )}

            {/* ===== CONFIRM ===== */}
            {showConfirm && (
              <div style={viewer.modalOverlay}>
                <div style={viewer.modal}>
                  <p>Are you sure?</p>
                  <div style={viewer.modalActions} className="gap-8">
                    <button
                      onClick={() => setShowConfirm(false)}
                      style={viewer.cancelBtn}
                      className="cursor-pointer rounded-4xl hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() =>
                        deleteStory(active.stories[index]._id)
                      }
                      style={viewer.deleteBtn}
                      className="cursor-pointer rounded-4xl hover:bg-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== MEDIA ===== */}
            {active.stories[index]?.type === "image" ? (
              <img src={active.stories[index].media} style={viewer.media} />
            ) : (
              <video
                // key={active.stories[index]._id}
                ref={videoRef}
                src={active.stories[index].media}
                autoPlay
                muted={isMuted}
                playsInline
                style={viewer.media}
                onTimeUpdate={() => {
                  const video = videoRef.current;
                  if (!video || !video.duration) return;

                  const percent = (video.currentTime / video.duration) * 100;
                  setProgress(percent);
                }}
                onEnded={() => {
                  nextStory();
                }}
              />
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Stories;



const styles = {
  wrapper: {
    display: "flex",
    gap: "10px",
    overflowX: "auto",
    padding: "10px",
  },


  card: {
    width: "120px",
    aspectRatio: "9/16",
    borderRadius: "12px",
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
    background: "#000",
    flexShrink: 0,
  },

  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  username: {
    position: "absolute",
    bottom: "8px",
    left: "8px",
    color: "#fff",
    fontSize: "13px",
  },

  createCard: {
    width: "120px",
    aspectRatio: "9/16",
    borderRadius: "12px",
    overflow: "hidden",
    position: "relative", // 🔥 IMPORTANT
    cursor: "pointer",
    background: "#fff",
    flexShrink: 0,
  },

  createImg: {
    width: "100%",
    height: "70%",
    objectFit: "cover",
  },

  topBar: {
    position: "absolute",
    top: "20px",
    left: "10px",
    right: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 20,
  },
  avatarWrapper: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    overflow: "hidden",
    flexShrink: 0,
    border: "2px solid white",   // 👈 makes it visible like Instagram
  },

  profileAvatar: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  plusWrapper: {
    position: "absolute",
    bottom: "35px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    background: "#1877f2",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "bold",
    border: "3px solid #fff",
  },

  createText: {
    position: "absolute",
    bottom: "8px",
    width: "100%",
    textAlign: "center",
    fontSize: "13px",
    fontWeight: "500",
  },
};

const viewer = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "#000",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },

  container: {
    width: "360px",
    height: "640px",
    position: "relative",
    borderRadius: "12px",
    overflow: "hidden",
  },

  media: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
  },

  tapArea: {
    position: "absolute",
    inset: 0,
    display: "flex",
    zIndex: 10,
  },

  leftTap: { width: "50%" },
  rightTap: { width: "50%" },

  sideNav: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    transform: "translateY(-50%)",
    display: "flex",
    justifyContent: "space-between",
    padding: "0 10px",
    zIndex: 25,
  },
  rightControls: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  sideBtnLeft: {
    background: "rgba(0,0,0,0.4)",
    border: "none",
    color: "#fff",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  sideBtnRight: {
    background: "rgba(0,0,0,0.4)",
    border: "none",
    color: "#fff",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  progressWrap: {
    position: "absolute",
    top: "8px",
    left: "8px",
    right: "8px",
    display: "flex",
    gap: "4px",
    zIndex: 30,
  },

  barContainer: {
    flex: 1,
    height: "5px",
    background: "rgba(255,255,255,0.4)",
    borderRadius: "10px",
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    background: "#fff",
    transition: "width 0.1s linear",
  },

  topBar: {
    position: "absolute",
    top: "20px",
    left: "10px",
    right: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 20,
  },

  iconBtn: {
    width: "35px",
    height: "35px",
    padding: 0,
    borderRadius: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.4)",
    border: "none",
    color: "#fff",
    cursor: "pointer",
  },

  menu: {
    position: "absolute",
    top: "60px",
    right: "10px",
    background: "#fff",
    borderRadius: "8px",
    padding: "10px",
    zIndex: 40,
  },

  menuItem: {
    border: "none",
    background: "none",
    color: "red",
    cursor: "pointer",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 50,
  },

  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
  },

  modalActions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },

  cancelBtn: {
    padding: "6px 12px",
  },

  deleteBtn: {
    padding: "6px 12px",
    background: "red",
    color: "#fff",
    border: "none",
  },
};