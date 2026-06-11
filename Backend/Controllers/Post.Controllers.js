import mongoose from "mongoose";
import { Post } from "../Models/Post.Models.js";
import { Comment } from "../Models/Comment.Models.js";
import { uploadOnCloudinary } from "../Middlewares/Cloudinary.js";
import { Subscriber } from "../Models/Subscribe.Models.js";



export const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { caption, visibility } = req.body;

    const mediaFiles = req.files?.media || [];

    const type = mediaFiles.length > 0 ? "image" : "text";

    if (type === "text" && !caption?.trim()) {
      return res.status(400).json({
        message: "Text post must have content",
      });
    }

    const uploadedMedia = [];

    // ✅ HANDLE MEDIA (only if exists)
    if (mediaFiles.length > 0) {
      for (const file of mediaFiles) {
        const result = await uploadOnCloudinary(file.path);

        if (!result) {
          return res.status(500).json({
            message: "Cloudinary upload failed",
          });
        }

        uploadedMedia.push(result.url);
      }
    }

    const post = await Post.create({
      user: userId,
      caption: caption || "", // ✅ safe fallback
      media: uploadedMedia,   // [] for text post
      visibility,
      type,
    });

    return res.status(201).json({
      success: true,
      post,
    });

  } catch (error) {
    console.error("Create Post Error:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};


export const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({ isDeleted: false })
      .populate("user", "username profileimage")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({ success: true, posts });

  } catch (error) {
    console.error("Get All Posts Error:", error);
    return res.status(500).json({ message: error.message });
  }
};


export const getUserPost = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const posts = await Post.find({
      user: userId,
      isDeleted: false
    })
      .populate("user", "username profileimage")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({ success: true, posts });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const toggleSavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findOne({
      _id: postId,
      isDeleted: false,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // ✅ FIX: correct ObjectId comparison
    const isSaved = post.savedBy.some(
      (id) => id.toString() === userId
    );

    let updatedPost;

    if (isSaved) {
      // 🔻 UNSAVE (atomic)
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { savedBy: userId },
          $inc: { savedCount: -1 },
        },
        { new: true }
      );
    } else {
      // 🔺 SAVE (atomic)
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        {
          $addToSet: { savedBy: userId },
          $inc: { savedCount: 1 },
        },
        { new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: isSaved ? "Post unsaved" : "Post saved",
      savedCount: updatedPost.savedCount,
      isSaved: !isSaved, // 🔥 REQUIRED for frontend
    });

  } catch (error) {
    console.error("Toggle Save Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const posts = await Post.find({
      savedBy: userId,
      isDeleted: false,
    })
      .populate("user", "username profileimage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      posts,
    });

  } catch (error) {
    console.error("Get Saved Posts Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const { caption, visibility } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid postId" });
    }

    const post = await Post.findById(postId);

    if (!post || post.isDeleted) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const mediaFiles = req.files?.media || [];

    if (mediaFiles.length > 0) {
      const uploadedMedia = [];

      for (const file of mediaFiles) {
        const result = await uploadOnCloudinary(file.path);

        if (!result) {
          return res.status(500).json({
            message: "Cloudinary upload failed",
          });
        }

        uploadedMedia.push(result.url);
      }

      post.media = uploadedMedia;
      post.type = "image";
    }

    if (caption !== undefined) {
      post.caption = caption;
    }

    if (visibility) {
      post.visibility = visibility;
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("user", "username profileimage");

    return res.status(200).json({
      success: true,
      post: updatedPost,
    });

  } catch (error) {
    console.error("Update Post Error:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post || post.isDeleted) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    post.isDeleted = true;
    await post.save();

    return res.status(200).json({ success: true, message: "Post deleted" });

  } catch (error) {
    console.error("Delete Post Error:", error);
    return res.status(500).json({ message: error.message });
  }
};


export const toggleLikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);

    if (!post || post.isDeleted) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes.pull(userId);
      post.likesCount -= 1;
    } else {
      post.likes.push(userId);
      post.likesCount += 1;
    }

    await post.save();

    return res.status(200).json({
      success: true,
      message: isLiked ? "Unliked" : "Liked",
      likesCount: post.likesCount,
    });

  } catch (error) {
    console.error("Like Error:", error);
    return res.status(500).json({ message: error.message });
  }
};


export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text, parentCommentId } = req.body;
    const userId = req.user.id;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Text required" });
    }

    // check post
    const post = await Post.findOne({
      _id: postId,
      isDeleted: false,
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    let parent = null;

    // ✅ If reply
    if (parentCommentId) {
      parent = await Comment.findById(parentCommentId);

      if (!parent || parent.isDeleted) {
        return res.status(404).json({ message: "Parent comment not found" });
      }

      // 🔥 Instagram rule: no reply to reply
      if (parent.parentComment !== null) {
        return res.status(400).json({
          message: "Cannot reply to a reply (only 2 levels allowed)",
        });
      }
    }

    const comment = await Comment.create({
      contentId: postId,
      user: userId,
      text: text.trim(),
      parentComment: parentCommentId || null,
    });

    // increment counts
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $inc: { repliesCount: 1 },
      });
    } else {
      await Post.findByIdAndUpdate(postId, {
        $inc: { commentsCount: 1 },
      });
    }

    return res.status(201).json({
      success: true,
      comment,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({
      contentId: postId,
      isDeleted: false,
    })
      .populate("user", "username profileimage")
      .sort({ createdAt: 1 });

    const map = {};
    const roots = [];

    // 🔥 Step 1: create map with STRING keys
    comments.forEach((c) => {
      map[c._id.toString()] = {
        ...c.toObject(),
        children: [],
      };
    });

    // 🔥 Step 2: build tree correctly
    comments.forEach((c) => {
      if (c.parentComment) {
        const parentId = c.parentComment.toString();

        if (map[parentId]) {
          map[parentId].children.push(
            map[c._id.toString()]
          );
        }
      } else {
        roots.push(map[c._id.toString()]);
      }
    });

    return res.status(200).json({ comments: roots });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};


export const getReplies = async (req, res) => {
  try {
    const { commentId } = req.params;

    const replies = await Comment.find({
      parentComment: commentId,
      isDeleted: false,
    })
      .populate("user", "username profileimage")
      .sort({ createdAt: 1 });

    return res.status(200).json({ replies });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // 🔐 Check ownership
    if (comment.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // 🚫 Prevent double delete (important)
    if (comment.isDeleted) {
      return res.status(400).json({ message: "Already deleted" });
    }

    // 🗑 Soft delete
    comment.isDeleted = true;
    comment.text = "This comment was deleted";
    await comment.save();

    // 🔥 MAIN FIX: DECREMENT COUNT
    if (comment.parentComment) {
      // reply case
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $inc: { repliesCount: -1 },
      });
    } else {
      // main comment case
      await Post.findByIdAndUpdate(comment.contentId, {
        $inc: { commentsCount: -1 },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Comment deleted",
    });

  } catch (error) {
    console.error("Delete Comment Error:", error);
    return res.status(500).json({ message: error.message });
  }
};


export const getExclusivePosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: creatorId } = req.params;

    if (userId === creatorId) {
      const posts = await Post.find({
        user: creatorId,
        visibility: "exclusive",
        isDeleted: false,
      })
        .populate("user", "username profileimage")
        .sort({ createdAt: -1 });

      return res.json({ success: true, posts });
    }

    const subscription = await Subscriber.findOne({
      subscriber: userId,
      creator: creatorId,
      status: "active",
      endDate: { $gt: new Date() },
    });

    if (!subscription) {
      return res.status(200).json({
        success: true,
        posts: [],
        message: "Not subscribed",
      });
    }

    const posts = await Post.find({
      user: creatorId,
      visibility: "exclusive",
      isDeleted: false,
    })
      .populate("user", "username profileimage")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      posts,
    });

  } catch (error) {
    console.error("Exclusive Posts Error:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};