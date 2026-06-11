import { Story } from "../Models/Story.Models.js";
import { User } from "../Models/User.Models.js";
import mongoose from "mongoose";
import fs from "fs";
import { uploadOnCloudinary } from "../Middlewares/Cloudinary.js";
import { v2 as cloudinary } from "cloudinary"; 



export const createStory = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Media file is required",
      });
    }

    // ✅ Detect type
    const mime = req.file.mimetype;
    let type;

    if (mime.startsWith("image")) type = "image";
    else if (mime.startsWith("video")) type = "video";
    else {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        success: false,
        message: "Only image and video are allowed",
      });
    }

    // ✅ Upload to Cloudinary
    const cloudinaryResult = await uploadOnCloudinary(req.file.path);

    if (!cloudinaryResult) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary upload failed",
      });
    }

    // 🔥 AUTO THUMBNAIL GENERATION
    let thumbnail = cloudinaryResult.url;

    if (type === "video") {
      thumbnail = cloudinary.url(cloudinaryResult.public_id, {
        resource_type: "video",
        format: "jpg", // convert video frame → image
        transformation: [
          { width: 300, height: 500, crop: "fill" },
          { quality: "auto" },
        ],
      });
    }

    // ✅ Story grouping logic
    const lastStory = await Story.findOne({ user: userId })
      .select("storyGroupId createdAt")
      .sort({ createdAt: -1 })
      .lean();

    let storyGroupId;

    if (
      lastStory &&
      Date.now() - new Date(lastStory.createdAt).getTime() < 5 * 60 * 1000
    ) {
      storyGroupId = lastStory.storyGroupId;
    } else {
      storyGroupId = new mongoose.Types.ObjectId();
    }

    // ✅ Sequence logic
    const lastSequence = await Story.findOne({ storyGroupId })
      .sort({ sequence: -1 })
      .select("sequence")
      .lean();

    const sequence = lastSequence ? lastSequence.sequence + 1 : 1;

    // ✅ Save story
    const story = await Story.create({
      user: userId,
      type,
      media: cloudinaryResult.url,
      public_id: cloudinaryResult.public_id,
      thumbnail,
      storyGroupId,
      sequence,
    });

    return res.status(201).json({
      success: true,
      message: "Story created successfully",
      story,
    });

  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});

    console.error("CREATE STORY ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    // 🔍 Find story
    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    // 🔐 Authorization check
    if (story.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // ☁️ Delete from Cloudinary
    if (story.public_id) {
      await cloudinary.uploader.destroy(story.public_id, {
        resource_type: story.type === "video" ? "video" : "image",
      });
    }

    // 🗑 Delete from MongoDB
    await Story.findByIdAndDelete(storyId);

    return res.status(200).json({
      success: true,
      message: "Story deleted successfully",
    });

  } catch (error) {
    console.error("DELETE STORY ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getUserStories = async (req, res) => {
  try {
    const { userId } = req.params;

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const stories = await Story.find({
      user: userId,
      createdAt: { $gte: last24Hours },
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      stories,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getStoryFeed = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const user = await User.findById(userId)
      .select("friends following")
      .lean();

    // 🔥 ensure all IDs are ObjectId
    const connections = [
      userId,
      ...(user.friends || []).map(id => new mongoose.Types.ObjectId(id)),
      ...(user.following || []).map(id => new mongoose.Types.ObjectId(id)),
    ];

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const stories = await Story.aggregate([

      // ✅ FILTER (SELF + CONNECTIONS)
      {
        $match: {
          createdAt: { $gte: last24Hours },
          user: { $in: connections },
        },
      },

      // oldest first inside group
      { $sort: { createdAt: 1 } },

      // ✅ GROUP STORIES
      {
        $group: {
          _id: "$storyGroupId",
          user: { $first: "$user" },
          stories: { $push: "$$ROOT" },
          latestCreatedAt: { $max: "$createdAt" },
        },
      },

      // newest group first
      { $sort: { latestCreatedAt: -1 } },

      // ✅ POPULATE USER
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // optional: remove sensitive fields
      {
        $project: {
          "user.password": 0,
          "user.email": 0,
        },
      },

    ]);

    return res.status(200).json({
      success: true,
      stories,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const toggleLikeStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    const isLiked = story.likes.some(
      id => id.toString() === userId
    );

    const update = isLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    const updated = await Story.findByIdAndUpdate(
      storyId,
      update,
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: isLiked ? "Unliked" : "Liked",
      likesCount: updated.likes.length,
      userId
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const addStoryView = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    await Story.findByIdAndUpdate(
      storyId,
      { $addToSet: { views: userId } }
    );

    return res.status(200).json({
      success: true,
      message: "Story viewed",
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getStoryViewers = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const story = await Story.findById(storyId)
      .populate({
        path: "views",
        select: "username profileimage",
        options: {
          skip: (page - 1) * limit,
          limit: parseInt(limit),
        },
      });

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    return res.status(200).json({
      success: true,
      viewers: story.views,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getStoryLikers = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const story = await Story.findById(storyId)
      .populate({
        path: "likes",
        select: "username profileimage",
        options: {
          skip: (page - 1) * limit,
          limit: parseInt(limit),
        },
      });

    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    return res.status(200).json({
      success: true,
      likers: story.likes,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const markStoryGroupSeen = async (req, res) => {
  try {
    const { storyGroupId } = req.params;
    const userId = req.user.id;

    await Story.updateMany(
      { storyGroupId },
      { $addToSet: { views: userId } }
    );

    return res.status(200).json({
      success: true,
      message: "All stories marked as seen",
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const isStoryGroupSeen = async (req, res) => {
  try {
    const { storyGroupId } = req.params;
    const userId = req.user.id;

    const result = await Story.aggregate([
      {
        $match: {
          storyGroupId: new mongoose.Types.ObjectId(storyGroupId),
        },
      },
      {
        $project: {
          isSeen: {
            $in: [new mongoose.Types.ObjectId(userId), "$views"],
          },
        },
      },
    ]);

    const seenAll = result.length > 0 && result.every(s => s.isSeen);

    return res.status(200).json({
      success: true,
      seenAll,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};