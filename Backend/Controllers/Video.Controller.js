import { Video } from "../Models/Video.Model.js";
import { Payment } from "../Models/Payment.Models.js";
// import { Subscriber } from "../Models/Subscribe.Models.js";
import { uploadOnCloudinary } from "../Middlewares/Cloudinary.js";
import { Comment } from "../Models/Comment.Models.js";
import mongoose from "mongoose";
import { Subscriber } from "../Models/Subscribe.Models.js";


export const createVideo = async (req, res) => {
  try {
    const userId = req.user.id;
    let { title, description, duration, visibility } = req.body;

    // console.log(userId);
    if (!title || !description || !duration) {
      return res.status(400).json({
        message: "Title, description and duration are required",
      });
    }

    duration = Number(duration);

    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({
        message: "Duration must be a valid number greater than 0",
      });
    }
    const videoFilePath = req.files?.videoFile?.[0]?.path;
    const thumbnailPath = req.files?.thumbnail?.[0]?.path;

    if (!videoFilePath || !thumbnailPath) {
      return res.status(400).json({
        message: "Video file and thumbnail are required",
      });
    }

    const uploadedVideo = await uploadOnCloudinary(videoFilePath);
    const uploadedThumbnail = await uploadOnCloudinary(thumbnailPath);

    if (!uploadedVideo?.url || !uploadedThumbnail?.url) {
      return res.status(500).json({
        message: "Error uploading media",
      });
    }

    const video = await Video.create({
      videoFile: uploadedVideo.url,
      thumbnail: uploadedThumbnail.url,
      title,
      description,
      duration,
      visibility,
      owner: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      video,
    });
  } catch (error) {
    console.error("Create Video Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleSaveVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    const video = await Video.findOne({
      _id: videoId,
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    const isSaved = video.savedBy?.includes(userId);

    let updatedVideo;

    if (isSaved) {
      // 🔻 UNSAVE
      updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
          $pull: { savedBy: userId },
          $inc: { savedCount: -1 },
        },
        { new: true }
      );
    } else {
      // 🔺 SAVE
      updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
          $addToSet: { savedBy: userId },
          $inc: { savedCount: 1 },
        },
        { new: true }
      );
    }

    return res.status(200).json({
      success: true,
      message: isSaved ? "Video unsaved" : "Video saved",
      savedCount: updatedVideo.savedCount,
      isSaved: !isSaved,
    });

  } catch (error) {
    console.error("Toggle Save Video Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllVideos = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const videos = await Video.find({ visibility: "public" })
      .populate("owner", "username profileimage")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Video.countDocuments({ visibility: "public" });

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      videos,
    });
  } catch (error) {
    console.error("Get All Videos Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserVideos = async (req, res) => {
  try {
    const { userId } = req.params;

    const videos = await Video.find({ owner: userId })
      .populate("owner", "username profileimage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      videos,
    });
  } catch (error) {
    console.error("Get User Videos Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getVideoById = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user?.id;

    const video = await Video.findById(videoId).populate(
      "owner",
      "username profileimage",
    );

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    if (video.visibility === "exclusive") {
      const hasAccess = await Payment.findOne({
        user: userId,
        creator: video.owner._id,
        status: "success",
        contentId: video._id,
        contentType: "Video",
      });

      if (!hasAccess) {
        return res.status(403).json({
          message: "This is exclusive content. Please purchase access.",
        });
      }
    }

    // 👁️ Increment views
    video.views += 1;
    await video.save();

    return res.status(200).json({
      success: true,
      video,
    });
  } catch (error) {
    console.error("Get Video Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// export const updateVideo = async (req, res) => {
//   try {
//     const { videoId } = req.params;
//     const userId = req.user._id;

//     const { title, description, visibility } = req.body;

//     const video = await Video.findById(videoId);

//     if (!video) {
//       return res.status(404).json({ message: "Video not found" });
//     }

//     if (video.owner.toString() !== userId.toString()) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     let isUpdated = false;

//     //  Update only if provided
//     if (title && title.trim() !== "") {
//       video.title = title.trim();
//       isUpdated = true;
//     }

//     if (description && description.trim() !== "") {
//       video.description = description.trim();
//       isUpdated = true;
//     }

//     if (visibility && ["public", "private"].includes(visibility)) {
//       video.visibility = visibility;
//       isUpdated = true;
//     }

//     //  Thumbnail update (optional)
//     const thumbnailPath = req.files?.thumbnail?.[0]?.path;

//     if (thumbnailPath) {
//       const uploadedThumbnail = await uploadOnCloudinary(thumbnailPath);

//       if (uploadedThumbnail?.url) {
//         video.thumbnail = uploadedThumbnail.url;
//         isUpdated = true;
//       }
//     }
//     if (!isUpdated) {
//       return res.status(400).json({
//         message: "No valid fields provided for update",
//       });
//     }

//     await video.save();

//     return res.status(200).json({
//       success: true,
//       message: "Video updated successfully",
//       video,
//     });

//   } catch (error) {
//     console.error("Update Video Error:", error);
//     return res.status(500).json({
//       message: `Internal server error: ${error.message}`
//     });
//   }
// };

export const updateVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    const { title, description, visibility } = req.body;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // 🔐 Ownership check
    if (video.owner.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let isUpdated = false;

    // 🔥 Title
    if (title && title.trim() !== "") {
      video.title = title.trim();
      isUpdated = true;
    }

    // 🔥 Description
    if (description && description.trim() !== "") {
      video.description = description.trim();
      isUpdated = true;
    }

    // 🔥 Visibility (FIXED)
    if (visibility && ["public", "exclusive"].includes(visibility)) {
      video.visibility = visibility;
      isUpdated = true;
    }

    // 🔥 Thumbnail (optional)
    const thumbnailPath = req.files?.thumbnail?.[0]?.path;

    if (thumbnailPath) {
      const uploaded = await uploadOnCloudinary(thumbnailPath);

      if (uploaded?.url) {
        video.thumbnail = uploaded.url;
        isUpdated = true;
      }
    }

    if (!isUpdated) {
      return res.status(400).json({
        message: "No valid fields provided for update",
      });
    }

    await video.save();

    return res.status(200).json({
      success: true,
      message: "Video updated successfully",
      video,
    });
  } catch (error) {
    console.error("Update Video Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (video.owner.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // ✅ FIXED LINE
    await Video.findByIdAndDelete(videoId);

    return res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("Delete Video Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const searchVideos = async (req, res) => {
  try {
    let { query } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    query = query.trim();

    const regex = new RegExp(query, "i");

    const videos = await Video.find({
      $and: [
        { visibility: { $regex: /^public$/i } },
        {
          $or: [{ title: regex }, { description: regex }],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (error) {
    console.error("Search Video Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleLikeVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    //  SAFETY FIX
    if (!video.likes) video.likes = [];
    if (!video.dislikes) video.dislikes = [];

    const liked = video.likes.some((id) => id.toString() === userId);
    const disliked = video.dislikes.some((id) => id.toString() === userId);

    if (liked) {
      video.likes.pull(userId);
    } else {
      video.likes.push(userId);
      if (disliked) {
        video.dislikes.pull(userId);
      }
    }

    await video.save();

    return res.status(200).json({
      message: liked ? "Like removed" : "Video liked",
      likesCount: video.likes.length,
      dislikesCount: video.dislikes.length,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const addVideoComment = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { text, parentComment } = req.body;
    const userId = req.user.id;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Text required" });
    }

    let parent = null;

    if (parentComment) {
      if (!mongoose.Types.ObjectId.isValid(parentComment)) {
        return res.status(400).json({ message: "Invalid parent ID" });
      }

      parent = await Comment.findById(parentComment);
      if (!parent) {
        return res.status(404).json({ message: "Parent not found" });
      }
    }

    const comment = await Comment.create({
      contentType: "Video",
      contentId: videoId,
      user: userId,
      text,
      parentComment: parent ? parent._id : null,
    });

    if (parent) {
      await Comment.findByIdAndUpdate(parent._id, {
        $inc: { repliesCount: 1 },
      });
    }

    // res.status(201).json({ success: true, comment });
    const populated = await comment.populate("user", "username profileimage");

res.status(201).json({
  success: true,
  comment: populated,
});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getVideoComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    

    // 🔒 Validate ID
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid videoId",
      });
    }

    // 🔥 Fetch comments
    const comments = await Comment.find({
      contentId: videoId,
      contentType: "Video",
      isDeleted: false,
    })
      .populate("user", "username profileimage")
      .sort({ createdAt: 1 })
      .lean();

    // 🔥 Build tree (nested comments)
    const map = {};
    const roots = [];

    // Step 1: map all comments
    comments.forEach((c) => {
      map[c._id.toString()] = {
        ...c,
        children: [],
      };
    });

    // Step 2: build hierarchy
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

    // ✅ Response
    return res.status(200).json({
      success: true,
      count: roots.length,
      comments: roots,
    });

  } catch (error) {
    console.error("Get Video Comments Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({
        message: "Invalid comment ID",
      });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.user.toString() !== userId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    comment.isDeleted = true;
    comment.text = "[deleted]";
    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};


export const getAllSavedVideos = async (req, res) => {
  try {
    const userId = req.user.id;

    const { page = 1, limit = 10 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    // ✅ Fetch saved videos
    const videos = await Video.find({
      savedBy: userId,
    })
      .populate("owner", "username profileimage")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Video.countDocuments({
      savedBy: userId,
    });

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      videos,
    });

  } catch (error) {
    console.error("Get Saved Videos Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const getExclusiveVideos = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: creatorId } = req.params;

    const subscription = await Subscriber.findOne({
      subscriber: userId,
      creator: creatorId,
      status: "active",
      endDate: { $gt: new Date() },
    });

    if (!subscription) {
      return res.status(403).json({
        message: "Subscribe to access videos",
      });
    }

    const videos = await Video.find({
      owner: creatorId,
      visibility: "exclusive",
    })
      .populate("owner", "username profileimage")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      videos,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};