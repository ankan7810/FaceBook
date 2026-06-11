import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  CircularProgress,
} from "@mui/material";
import { UploadCloud, Image, Video } from "lucide-react";
import toast from "react-hot-toast";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1";

const UploadReel = () => {
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

const handleUpload = async () => {
  if (!video) {
    toast.error("Video is required 🎥");
    return;
  }

  try {
    setLoading(true);

    const formData = new FormData();
    formData.append("video", video);
    if (thumbnail) formData.append("thumbnail", thumbnail);
    formData.append("caption", caption);

    const res = await axios.post(
      `${BASE_URL}/reels/create`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }
    );

    if (res.data.success) {
      toast.success("Reel uploaded successfully 🚀");

      setVideo(null);
      setThumbnail(null);
      setCaption("");
    }
  } catch (err) {
    console.error(err);
    toast.error("Upload failed ❌");
  } finally {
    setLoading(false);
  }
};

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        padding: 2,
      }}
    >
      <Card
        sx={{
          width: 420,
          borderRadius: 4,
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.9)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        }}
      >
        <CardContent>
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Upload Reel 🎬
          </Typography>

          {/* VIDEO UPLOAD */}
          <Button
            component="label"
            fullWidth
            startIcon={<Video />}
            sx={{
              mb: 2,
              padding: 1.5,
              borderRadius: 3,
              background: "#f5f5f5",
              color: "#333",
              justifyContent: "flex-start",
            }}
          >
            {video ? video.name : "Select Video"}
            <input
              hidden
              type="file"
              accept="video/*"
              onChange={(e) => setVideo(e.target.files[0])}
            />
          </Button>

          {/* VIDEO PREVIEW */}
          {video && (
            <video
              src={URL.createObjectURL(video)}
              controls
              style={{
                width: "100%",
                borderRadius: "12px",
                marginBottom: "12px",
              }}
            />
          )}

          {/* THUMBNAIL */}
          <Button
            component="label"
            fullWidth
            startIcon={<Image />}
            sx={{
              mb: 2,
              padding: 1.5,
              borderRadius: 3,
              background: "#f5f5f5",
              color: "#333",
              justifyContent: "flex-start",
            }}
          >
            {thumbnail ? thumbnail.name : "Select Thumbnail"}
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files[0])}
            />
          </Button>

          {/* THUMBNAIL PREVIEW */}
          {thumbnail && (
            <img
              src={URL.createObjectURL(thumbnail)}
              alt="thumb"
              style={{
                width: "100%",
                borderRadius: "12px",
                marginBottom: "12px",
              }}
            />
          )}

          {/* CAPTION */}
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* UPLOAD BUTTON */}
          <Button
            fullWidth
            onClick={handleUpload}
            disabled={loading}
            sx={{
              padding: 1.5,
              borderRadius: 3,
              fontWeight: "bold",
              background: "linear-gradient(45deg, #1877f2, #42a5f5)",
              color: "#fff",
              "&:hover": {
                background: "linear-gradient(45deg, #166fe5, #1e88e5)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <>
                <UploadCloud size={18} style={{ marginRight: 8 }} />
                Upload Reel
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UploadReel;