import { Reel } from "../Models/Reels.Models.js";
import { Comment } from "../Models/Comment.Models.js";
import { uploadOnCloudinary } from "../Middlewares/Cloudinary.js";
import mongoose from "mongoose";


export const createReel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { caption } = req.body;

    const videoPath = req.files?.video?.[0]?.path;
    const thumbnailPath = req.files?.thumbnail?.[0]?.path;

    if (!videoPath) {
      return res.status(400).json({ message: "Video is required" });
    }

    const uploadedVideo = await uploadOnCloudinary(videoPath);
    const uploadedThumbnail = thumbnailPath
      ? await uploadOnCloudinary(thumbnailPath)
      : null;

    if (!uploadedVideo?.url) {
      return res.status(500).json({ message: "Upload failed" });
    }

    const reel = await Reel.create({
      video: uploadedVideo.url,
      thumbnail: uploadedThumbnail?.url,
      caption,
      owner: userId,
    });

    return res.status(201).json({
      success: true,
      reel,
    });

  } catch (error) {
    console.error("Create Reel Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getReelsFeed = async (req, res) => {
  try {
    const userId = req.user.id;

    const reels = await Reel.find({ isDeleted: false })
      .populate("owner", "username profileimage")
      .sort({ createdAt: -1 });

    const enrichedReels = await Promise.all(
      reels.map(async (reel) => {

        const commentsCount = await Comment.countDocuments({
          contentId: reel._id,
          parentComment: null,
          isDeleted: false,
        });

        const isLiked = reel.likes?.some(
          (id) => id.toString() === userId.toString()
        );

        return {
          _id: reel._id,
          video: reel.video,
          thumbnail: reel.thumbnail,
          caption: reel.caption,
          owner: reel.owner,

          likes: reel.likes, 
          likesCount: reel.likes?.length || 0,
          isLiked,

          views: reel.views,

          commentsCount, 

          createdAt: reel.createdAt,
        };
      })
    );

    return res.status(200).json({
      success: true,
      reels: enrichedReels,
    });

  } catch (err) {
    console.error("getReelsFeed error:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const getReelById = async (req, res) => {
  try {
    const { reelId } = req.params;

    const reel = await Reel.findById(reelId)
      .populate("owner", "username profileimage");

    if (!reel || reel.isDeleted) {
      return res.status(404).json({ message: "Reel not found" });
    }

    return res.status(200).json({
      success: true,
      reel,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



export const deleteReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    const userId = req.user.id;

    const reel = await Reel.findById(reelId);

    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    if (reel.owner.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    reel.isDeleted = true;
    await reel.save();

    return res.status(200).json({
      success: true,
      message: "Reel deleted",
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const toggleLikeReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    const userId = req.user.id;

    const reel = await Reel.findById(reelId);

    if (!reel || reel.isDeleted) {
      return res.status(404).json({ message: "Reel not found" });
    }

    const isLiked = reel.likes.includes(userId);

    if (isLiked) {
      reel.likes.pull(userId);
    } else {
      reel.likes.push(userId);
    }

    await reel.save();

    const updatedIsLiked = reel.likes.includes(userId);

    return res.status(200).json({
      message: updatedIsLiked ? "Liked" : "Unliked",
      likesCount: reel.likes.length,
      isLiked: updatedIsLiked,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



export const addReelView = async (req, res) => {
  try {
    const { reelId } = req.params;
    const userId = req.user.id;

    const reel = await Reel.findById(reelId);

    if (!reel || reel.isDeleted) {
      return res.status(404).json({ message: "Reel not found" });
    }

    if (!reel.viewedBy.includes(userId)) {
      reel.viewedBy.push(userId);
      reel.views += 1;
      await reel.save();
    }

    return res.status(200).json({
      views: reel.views,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



export const addReelComment = async (req, res) => {
  try {
    const { reelId } = req.params;
    const { text, parentComment } = req.body;
    const userId = req.user.id; 

    // 🔒 basic validation
    if (!mongoose.Types.ObjectId.isValid(reelId)) {
      return res.status(400).json({ message: "Invalid reelId" });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const reel = await Reel.findOne({
      _id: reelId,
      isDeleted: false,
    });

    if (!reel) {
      return res.status(404).json({ message: "Reel not found" });
    }

    // 🎯 if reply, validate parent comment
    let parent = null;
    if (parentComment) {
      if (!mongoose.Types.ObjectId.isValid(parentComment)) {
        return res.status(400).json({ message: "Invalid parentComment id" });
      }

      parent = await Comment.findOne({
        _id: parentComment,
        contentId: reelId,
        isDeleted: false,
      });

      if (!parent) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
    }

    const comment = await Comment.create({
      contentId: reelId,
      user: userId,
      text: text.trim(),
      parentComment: parent ? parent._id : null,
    });

    // 🔢 update counters
    if (parent) {
      // reply → increment parent's repliesCount
      await Comment.findByIdAndUpdate(parent._id, {
        $inc: { repliesCount: 1 },
      });
    } else {
      await Reel.findByIdAndUpdate(reelId, {
        $inc: { commentsCount: 1 },
      });
    }

    const populated = await Comment.findById(comment._id).populate(
      "user",
      "username profileimage"
    );

    return res.status(201).json({
      success: true,
      comment: populated,
      // helpful for UI if you want
      isReply: !!parent,
    });
  } catch (err) {
    console.error("addReelComment error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getReelComments = async (req, res) => {
  try {
    const { reelId } = req.params;

    const comments = await Comment.find({
      contentId: reelId,
      isDeleted: false
    })
      .populate("user", "username profileimage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      comments,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



export const deleteReelComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);

    if (!comment ) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (comment.isDeleted) {
      return res.status(400).json({ message: "Already deleted" });
    }

    comment.isDeleted = true;
    comment.text = "This comment was deleted";
    await comment.save();

    return res.status(200).json({
      message: "Comment deleted",
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const getUserReels = async (req, res) => {
  try {
    const { userId } = req.params;

    const reels = await Reel.find({
      owner: userId,
      isDeleted: false,
    })
      .populate("owner", "username profileimage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reels,
    });

  } catch (error) {
    console.error("getUserReels error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};