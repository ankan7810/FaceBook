import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1";

const DeletePost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

const handleDelete = async () => {
  try {
    setLoading(true);

    await axios.delete(
      `${BASE_URL}/post/delete/${postId}`,
      { withCredentials: true }
    );

    toast.success("Post deleted successfully");
    navigate("/");

  } catch (err) {

    if (err.response) {
      const message = err.response.data?.message;

      if (err.response.status === 403) {
        toast.error("You are not allowed to delete this post");
      } else if (err.response.status === 404) {
        toast.error("Post not found");
      } else {
        toast.error(message || "Something went wrong");
      }
    } else {
      toast.error("Network error");
    }

  } finally {
    setLoading(false);
  }
};

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Delete Post</h2>

        <p style={styles.text}>
          Are you sure you want to delete this post?
        </p>

        <div style={styles.actions}>
          <button
            style={styles.cancel}
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>

          <button
            style={styles.delete}
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePost;




const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "#f4f6f8",
  },

  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },

  title: {
    marginBottom: "10px",
    color: "#111827",
  },

  text: {
    color: "#6b7280",
    marginBottom: "20px",
  },

  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
  },

  cancel: {
    background: "#f3f4f6",
    border: "1px solid #e5e7eb",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
  },

  delete: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "10px",
    cursor: "pointer",
  },
};