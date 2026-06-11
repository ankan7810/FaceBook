import React, { useState, useRef, useEffect, useMemo } from "react";
import axios from "axios";
import { FaCloudUploadAlt, FaSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1";

const UploadVideo = () => {
    const [video, setVideo] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [visibility, setVisibility] = useState("public"); // ✅ NEW
    const [showEmoji, setShowEmoji] = useState(false);
    const [activeField, setActiveField] = useState("title");
    const [loading, setLoading] = useState(false);

    const emojiRef = useRef();
    const fileInputRef = useRef();

    const videoURL = useMemo(() => {
        if (!video) return null;
        return URL.createObjectURL(video);
    }, [video]);

    useEffect(() => {
        return () => {
            if (videoURL) URL.revokeObjectURL(videoURL);
        };
    }, [videoURL]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiRef.current && !emojiRef.current.contains(event.target)) {
                setShowEmoji(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const generateThumbnail = (file) => {
        return new Promise((resolve) => {
            const video = document.createElement("video");
            video.src = URL.createObjectURL(file);
            video.currentTime = 1;

            video.onloadeddata = () => {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(video, 0, 0);

                canvas.toBlob((blob) => resolve(blob), "image/jpeg");
            };
        });
    };

    const handleEmojiClick = (emojiData) => {
        const emoji = emojiData.emoji;

        if (activeField === "title") {
            setTitle((prev) => prev + emoji);
        } else {
            setDescription((prev) => prev + emoji);
        }
    };

const handleUpload = async () => {
  if (!video || !title) {
    return toast.error("Video and title are required");
  }

  const toastId = toast.loading("Uploading...");

  try {
    setLoading(true);

    const formData = new FormData();

    const thumb = await generateThumbnail(video);

    const videoEl = document.createElement("video");
    videoEl.src = URL.createObjectURL(video);

    await new Promise((res) => {
      videoEl.onloadedmetadata = res;
    });

    const duration = Math.floor(videoEl.duration);

    formData.append("title", title);
    formData.append("description", description);
    formData.append("duration", duration);
    formData.append("visibility", visibility);
    formData.append("videoFile", video);
    formData.append("thumbnail", thumb, "thumbnail.jpg");

    await axios.post(
      `${BASE_URL}/video/create`,
      formData,
      { withCredentials: true }
    );

    toast.success("Uploaded successfully 🚀", { id: toastId });

    setVideo(null);
    setTitle("");
    setDescription("");
    setVisibility("public");

  } catch (err) {
    console.error(err);
    toast.error("Upload failed", { id: toastId });
  } finally {
    setLoading(false);
  }
};

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Upload Video</h2>

                {/* VIDEO PREVIEW */}
                {video ? (
                    <video
                        src={videoURL}
                        controls
                        style={styles.preview}
                    />
                ) : (
                    <div
                        style={styles.uploadBox}
                        onClick={() => fileInputRef.current.click()}
                    >
                        <FaCloudUploadAlt size={40} />
                        <p>Select a video</p>
                    </div>
                )}

                <input
                    type="file"
                    accept="video/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={(e) => setVideo(e.target.files[0])}
                />

                {/* TITLE */}
                <div style={styles.inputWrapper}>
                    <input
                        type="text"
                        placeholder="Video Title"
                        value={title}
                        onFocus={() => setActiveField("title")}
                        onChange={(e) => setTitle(e.target.value)}
                        style={styles.input}
                    />
                    <FaSmile
                        style={styles.emojiBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowEmoji(prev => !prev);
                        }}
                    />
                </div>

                {/* DESCRIPTION */}
                <div style={styles.inputWrapper}>
                    <textarea
                        placeholder="Description"
                        value={description}
                        onFocus={() => setActiveField("description")}
                        onChange={(e) => setDescription(e.target.value)}
                        style={styles.textarea}
                    />
                    <FaSmile
                        style={styles.emojiBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowEmoji(prev => !prev);
                        }}
                    />
                </div>

                {/* ✅ NEW: VISIBILITY */}
                <div style={styles.inputWrapper}>
                    <select
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                        style={styles.select}   // 👈 changed
                    >
                        <option value="public">🌍 Public</option>
                        <option value="exclusive">🔒 Exclusive (Paid)</option>
                    </select>
                </div>

                {/* EMOJI PICKER */}
                {showEmoji && (
                    <div style={styles.emojiPicker} ref={emojiRef}>
                        <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    style={styles.button}
                    disabled={loading}
                >
                    {loading ? "Uploading..." : "Upload"}
                </button>
            </div>
        </div>
    );
};

export default UploadVideo;

/* 🔒 STYLES UNCHANGED */
const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg,#667eea,#764ba2)",
    },

    card: {
        width: "420px",
        padding: "20px",
        borderRadius: "16px",
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        color: "#fff",
        position: "relative",
    },

    title: {
        textAlign: "center",
        marginBottom: "15px",
    },

    preview: {
        width: "100%",
        borderRadius: "10px",
        marginBottom: "10px",
    },

    uploadBox: {
        border: "2px dashed #fff",
        padding: "30px",
        textAlign: "center",
        borderRadius: "10px",
        marginBottom: "10px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        cursor: "pointer",
    },

    inputWrapper: {
        position: "relative",
        marginTop: "10px",
    },

    input: {
        width: "100%",
        padding: "10px",
        borderRadius: "8px",
        border: "none",
    },

    textarea: {
        width: "100%",
        padding: "10px",
        borderRadius: "8px",
        border: "none",
        height: "80px",
    },

    emojiBtn: {
        position: "absolute",
        right: "10px",
        top: "12px",
        cursor: "pointer",
    },

    emojiPicker: {
        position: "absolute",
        bottom: "70px",
        right: "20px",
        zIndex: 10,
    },
    select: {
        width: "100%",
        padding: "10px",
        borderRadius: "8px",
        border: "none",
        outline: "none",
        fontSize: "14px",
        cursor: "pointer",

        // 🔥 improved look
        background: "linear-gradient(135deg, #ffffff, #f1f2f6)",
        color: "#333",
        fontWeight: "500",

        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        transition: "0.2s ease",

        appearance: "none", // removes default ugly arrow
    },

    button: {
        width: "100%",
        padding: "12px",
        marginTop: "15px",
        borderRadius: "10px",
        border: "none",
        background: "#ff4757",
        color: "#fff",
        fontWeight: "bold",
        cursor: "pointer",
    },
};