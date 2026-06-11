import express from "express";
import isAuth from "../Middlewares/isAuth.js";
import {
  addStoryView,
  createStory,
  deleteStory,
  getStoryFeed,
  getStoryLikers,
  getStoryViewers,
  getUserStories,
  isStoryGroupSeen,
  markStoryGroupSeen,
  toggleLikeStory,
} from "../Controllers/Story.Controller.js";
import { upload } from "../Middlewares/Multer.js";

const storyrouter = express.Router();

storyrouter.post("/create", isAuth, upload.single("media"), createStory);
storyrouter.delete("/delete/:storyId", isAuth, deleteStory);
storyrouter.get("/feed", isAuth, getStoryFeed);
storyrouter.get("/user/:userId", isAuth, getUserStories);
storyrouter.post("/like/:storyId", isAuth, toggleLikeStory);
storyrouter.post("/view/:storyId", isAuth, addStoryView);
storyrouter.post("/view/group/:storyGroupId", isAuth, markStoryGroupSeen);
storyrouter.get("/viewers/:storyId", isAuth, getStoryViewers);
storyrouter.get("/likers/:storyId", isAuth, getStoryLikers);
storyrouter.get("/groupseen/:storyGroupId", isAuth, isStoryGroupSeen);

export default storyrouter;
