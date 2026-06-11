import express from "express";
import isAuth from "../Middlewares/isAuth.js";
import { addComment, createPost, deleteComment, deletePost, getAllPosts, getExclusivePosts, getPostComments, getReplies, getSavedPosts, getUserPost, toggleLikePost, toggleSavePost, updatePost } from "../Controllers/Post.Controllers.js";
import { upload } from "../Middlewares/Multer.js";

const postrouter = express.Router();

postrouter.post("/create", isAuth, upload.fields([{ name: "media",maxCount:1 }]), createPost);
postrouter.delete("/delete/:postId", isAuth, deletePost);
postrouter.get("/feed", isAuth, getAllPosts);
postrouter.get("/user/:userId", isAuth, getUserPost);

postrouter.post("/like/:postId", isAuth, toggleLikePost);
postrouter.post("/comment/:postId", isAuth, addComment);
postrouter.get("/comment/:postId", isAuth, getPostComments);
postrouter.get("/replies/:commentId", isAuth, getReplies);
postrouter.delete("/comment-del/:commentId", isAuth, deleteComment);
postrouter.put("/update/:postId", isAuth, updatePost);     
postrouter.post("/save/:postId", isAuth, toggleSavePost);
postrouter.get("/saved", isAuth, getSavedPosts);  
postrouter.get("/exclusive/:userId", isAuth, getExclusivePosts);

export default postrouter;