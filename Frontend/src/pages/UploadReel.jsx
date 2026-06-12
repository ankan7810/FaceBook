import React, { useState, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";

const UploadReel = () => {
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const [videoPreview, setVideoPreview] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleVideoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }

    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [videoPreview, thumbnailPreview]);

  const handleUpload = async () => {
    if (!video) {
      toast.error("Video is required 🎥");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("video", video);

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      formData.append("caption", caption);

      const res = await axios.post(
        `${BASE_URL}/reels/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success("Reel uploaded successfully 🚀");

        setVideo(null);
        setThumbnail(null);
        setVideoPreview("");
        setThumbnailPreview("");
        setCaption("");

        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Upload failed ❌"
      );
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
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 450,
          borderRadius: 4,
          background: "#fff",
          boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h5"
            fontWeight="bold"
            textAlign="center"
            mb={3}
          >
            Upload Reel 🎬
          </Typography>

          {/* Video Upload */}
          <Button
            component="label"
            fullWidth
            startIcon={<Video />}
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 3,
              bgcolor: "#f5f5f5",
              color: "#333",
              justifyContent: "flex-start",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {video ? video.name : "Select Video"}
            <input
              hidden
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
            />
          </Button>

          {/* Video Preview */}
          {videoPreview && (
            <video
              src={videoPreview}
              controls
              style={{
                width: "100%",
                borderRadius: "12px",
                marginBottom: "16px",
                maxHeight: "400px",
                objectFit: "contain",
                background: "#000",
              }}
            />
          )}

          {/* Thumbnail Upload */}
          <Button
            component="label"
            fullWidth
            startIcon={<Image />}
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: 3,
              bgcolor: "#f5f5f5",
              color: "#333",
              justifyContent: "flex-start",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {thumbnail
              ? thumbnail.name
              : "Select Thumbnail (Optional)"}

            <input
              hidden
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
            />
          </Button>

          {/* Thumbnail Preview */}
          {thumbnailPreview && (
            <img
              src={thumbnailPreview}
              alt="thumbnail"
              style={{
                width: "100%",
                borderRadius: "12px",
                marginBottom: "16px",
                maxHeight: "250px",
                objectFit: "cover",
              }}
            />
          )}

          {/* Caption */}
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            sx={{ mb: 3 }}
          />

          {/* Upload Button */}
          <Button
            fullWidth
            disabled={loading}
            onClick={handleUpload}
            sx={{
              py: 1.5,
              borderRadius: 3,
              color: "#fff",
              fontWeight: "bold",
              background:
                "linear-gradient(45deg, #1877f2, #42a5f5)",
              "&:hover": {
                background:
                  "linear-gradient(45deg, #166fe5, #1e88e5)",
              },
            }}
          >
            {loading ? (
              <CircularProgress
                size={24}
                sx={{ color: "#fff" }}
              />
            ) : (
              <>
                <UploadCloud
                  size={18}
                  style={{ marginRight: 8 }}
                />
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
