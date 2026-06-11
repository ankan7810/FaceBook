// import express from "express";
// import isAuth from "../Middlewares/isAuth.js";

// import { upload } from "../Middlewares/Multer.js";
// import { addVideoComment, createVideo, deleteComment, deleteVideo, getAllSavedVideos, getAllVideos, getExclusiveVideos, getUserVideos, getVideoById, getVideoComments, searchVideos, toggleLikeVideo, toggleSaveVideo, updateVideo } from "../Controllers/Video.Controller.js";

// const videorouter = express.Router();

// videorouter.post(
//   "/create",
//   isAuth,
//   upload.fields([
//     { name: "videoFile", maxCount: 1 },
//     { name: "thumbnail", maxCount: 1 }
//   ]),
//   createVideo
// );
// videorouter.get("/allvideos", isAuth, getAllVideos);
// videorouter.get("/search", isAuth, searchVideos);
// videorouter.get("/user/:userId", isAuth, getUserVideos);
// videorouter.get("/:userId/:videoId", isAuth, getVideoById);
// videorouter.put(
//   "/update/:videoId",
//   isAuth,
//   upload.fields([{ name: "thumbnail", maxCount: 1 }]),
//   updateVideo
// );
// videorouter.delete("/delete/:videoId", isAuth, deleteVideo);
// videorouter.post("/like/:videoId", isAuth, toggleLikeVideo);
// videorouter.post("/comment/:videoId", isAuth, addVideoComment);
// videorouter.get("/comments/:videoId", isAuth, getVideoComments);
// videorouter.delete("/comment/:commentId", isAuth, deleteComment);
// videorouter.post("/save/:videoId", isAuth, toggleSaveVideo);
// videorouter.get("/saved", isAuth, getAllSavedVideos);
// videorouter.get("/exclusive/:userId", isAuth, getExclusiveVideos);

// export default videorouter;














import express from "express";
import isAuth from "../Middlewares/isAuth.js";
import { upload } from "../Middlewares/Multer.js";

import {
  addVideoComment,
  createVideo,
  deleteComment,
  deleteVideo,
  getAllSavedVideos,
  getAllVideos,
  getExclusiveVideos,
  getUserVideos,
  getVideoById,
  getVideoComments,
  searchVideos,
  toggleLikeVideo,
  toggleSaveVideo,
  updateVideo,
} from "../Controllers/Video.Controller.js";

const videorouter = express.Router();

videorouter.post(
  "/create",
  isAuth,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  createVideo
);

videorouter.get("/allvideos", isAuth, getAllVideos);
videorouter.get("/search", isAuth, searchVideos);
videorouter.get("/user/:userId", isAuth, getUserVideos);

// ✅ MOVE THIS ABOVE
videorouter.get("/exclusive/:userId", isAuth, getExclusiveVideos);

// ❗ KEEP THIS LAST ALWAYS
videorouter.get("/:userId/:videoId", isAuth, getVideoById);

videorouter.put(
  "/update/:videoId",
  isAuth,
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  updateVideo
);

videorouter.delete("/delete/:videoId", isAuth, deleteVideo);
videorouter.post("/like/:videoId", isAuth, toggleLikeVideo);
videorouter.post("/comment/:videoId", isAuth, addVideoComment);
videorouter.get("/comments/:videoId", isAuth, getVideoComments);
videorouter.delete("/comment/:commentId", isAuth, deleteComment);
videorouter.post("/save/:videoId", isAuth, toggleSaveVideo);
videorouter.get("/saved", isAuth, getAllSavedVideos);

export default videorouter;