import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchFeed } from "@/redux/feedSlice";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1";

const UpdateVideo = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const fileRef = useRef();

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/video/${videoId}`,
          { withCredentials: true }
        );
        const v = res.data.video;
        setTitle(v.title || "");
        setDescription(v.description || "");
        setVisibility(v.visibility || "public");
        setPreview(v.thumbnail || "");
      } catch (err) {
        console.error(err);
      }
    };
    fetchVideo();
  }, [videoId]);

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("visibility", visibility);

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      await axios.put(
        `${BASE_URL}/video/update/${videoId}`,
        formData,
        { withCredentials: true }
      );

      dispatch(fetchFeed());
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Update Video</h2>

        <div
          style={styles.thumbnailBox}
          onClick={() => fileRef.current.click()}
        >
          {preview ? (
            <img src={preview} style={styles.preview} />
          ) : (
            <p>Select Thumbnail</p>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileRef}
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files[0];
            setThumbnail(file);
            setPreview(URL.createObjectURL(file));
          }}
        />

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          style={styles.input}
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          style={styles.textarea}
        />

        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          style={styles.select}
        >
          <option value="public">Public</option>
          <option value="exclusive">Exclusive</option>
        </select>

        <button
          onClick={handleUpdate}
          style={styles.button}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update"}
        </button>
      </div>
    </div>
  );
};

export default UpdateVideo;

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f0f2f5",
  },
  card: {
    width: "400px",
    padding: "20px",
    background: "#fff",
    borderRadius: "12px",
  },
  thumbnailBox: {
    height: "200px",
    background: "#eee",
    borderRadius: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    marginBottom: "10px",
  },
  preview: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "10px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    height: "80px",
  },
  select: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
  },
  button: {
    width: "100%",
    padding: "12px",
    marginTop: "15px",
    background: "#1877f2",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};