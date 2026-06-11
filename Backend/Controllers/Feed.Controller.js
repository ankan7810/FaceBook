import { Post } from "../Models/Post.Models.js";
import { Video } from "../Models/Video.Model.js";

export const getFeed = async (req, res) => {
  try {
    const userId = req.user?.id; 

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const postsPromise = Post.find({
      isDeleted: false,
      visibility: "public",
    })
      .populate("user", "username profileimage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // 🔹 Fetch Videos
    const videosPromise = Video.find({
      visibility: "public",
    })
      .populate("owner", "username profileimage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const [posts, videos] = await Promise.all([postsPromise, videosPromise]);

    const formattedPosts = posts.map((p) => ({
      _id: p._id,
      type: "post",
      createdAt: p.createdAt,
      user: p.user,
      caption: p.caption,
      media: p.media,
      likes: p.likes,
      commentsCount: p.commentsCount,
    }));


    const formattedVideos = videos.map((v) => ({
      _id: v._id,
      type: "video",
      createdAt: v.createdAt,
      user: v.owner,
      videoFile: v.videoFile,
      thumbnail: v.thumbnail,
      description: v.description,
      likes: v.likes,
    }));

    // 🔥 Merge + Sort
    const mergedFeed = [...formattedPosts, ...formattedVideos].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    return res.status(200).json({
      success: true,
      page,
      limit,
      count: mergedFeed.length,
      feed: mergedFeed,
    });
  } catch (error) {
    console.error("Feed Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
