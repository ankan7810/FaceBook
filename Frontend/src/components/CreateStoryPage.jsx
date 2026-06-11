import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "@/Utils/Constant.js";


const CreateStoryPage = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return alert("Select a file first");

    const formData = new FormData();
    formData.append("media", file);

    try {
      setLoading(true);

      await axios.post(
        "https://facebook-backend-6nqa.onrender.com/api/v1/strory/create",
        formData,
        { withCredentials: true }
      );

      navigate("/");
    } catch (err) {
      console.error("ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>

      {/* LEFT PANEL */}
      <div style={styles.sidebar}>
        <h2>Your Story</h2>
        <p>Select media and share instantly</p>

        <button style={styles.backBtn} onClick={() => navigate("/")}>
          ← Back
        </button>
      </div>

      {/* MAIN AREA */}
      <div style={styles.main}>

        {!preview ? (
          <div style={styles.options}>

            {/* IMAGE STORY */}
            <label style={styles.card}>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleSelect}
              />
              <div style={styles.icon}>🖼️</div>
              <p>Image Story</p>
            </label>

            {/* VIDEO STORY */}
            <label style={styles.card}>
              <input
                type="file"
                accept="video/*"
                hidden
                onChange={handleSelect}
              />
              <div style={styles.icon}>🎥</div>
              <p>Video Story</p>
            </label>

          </div>
        ) : (
          <div style={styles.previewContainer}>

            {file.type.startsWith("image") ? (
              <img src={preview} alt="" style={styles.preview} />
            ) : (
              <video src={preview} controls style={styles.preview} />
            )}

            <div style={styles.actions}>
              <button
                style={styles.btn}
                onClick={() => {
                  setPreview(null);
                  setFile(null);
                }}
              >
                Cancel
              </button>

              <button
                style={styles.btnPrimary}
                onClick={handleUpload}
                disabled={loading}
              >
                {loading ? "Uploading..." : "Share to Story"}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default CreateStoryPage;



const styles = {
  page: {
    display: "flex",
    height: "100vh",
    background: "#f0f2f5",
  },

  sidebar: {
    width: "280px",
    background: "#fff",
    padding: "20px",
    borderRight: "1px solid #ddd",
  },

  backBtn: {
    marginTop: "20px",
    padding: "8px 12px",
    border: "none",
    cursor: "pointer",
    background: "#1877f2",
    color: "#fff",
    borderRadius: "6px",
  },

  main: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  options: {
    display: "flex",
    gap: "20px",
  },

  card: {
    width: "220px",
    height: "350px",
    borderRadius: "16px",
    background: "linear-gradient(45deg,#6a11cb,#2575fc)",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  },

  icon: {
    fontSize: "40px",
    marginBottom: "10px",
  },

  previewContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  preview: {
    width: "300px",
    height: "500px",
    objectFit: "cover",
    borderRadius: "12px",
  },

  actions: {
    marginTop: "15px",
    display: "flex",
    gap: "10px",
  },

  btn: {
    padding: "10px 15px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },

  btnPrimary: {
    padding: "10px 15px",
    borderRadius: "8px",
    border: "none",
    background: "#1877f2",
    color: "#fff",
    cursor: "pointer",
  },
};

















