import express from "express";
import isAuth from "../Middlewares/isAuth.js";
import { addReelComment, addReelView, createReel, deleteReel, deleteReelComment, getReelById, getReelComments, getReelsFeed, getUserReels, toggleLikeReel } from "../Controllers/Reels.Controller.js";
import { upload } from "../Middlewares/Multer.js";

const reelsrouter = express.Router();

reelsrouter.post("/create", isAuth, upload.fields([{ name: "video",maxCount:1 }, { name: "thumbnail",maxCount:1 }]), createReel);
reelsrouter.delete("/:reelId", isAuth, deleteReel);
reelsrouter.get("/feed", isAuth, getReelsFeed);
reelsrouter.get("/:reelId", isAuth, getReelById);

reelsrouter.post("/like/:reelId", isAuth, toggleLikeReel);
reelsrouter.post("/view/:reelId", isAuth, addReelView); 
reelsrouter.post("/comment/:reelId", isAuth, addReelComment);
reelsrouter.get("/comment/:reelId", isAuth, getReelComments);
reelsrouter.delete("/comment-del/:commentId", isAuth, deleteReelComment);
reelsrouter.get("/user/:userId", isAuth, getUserReels);

export default reelsrouter;