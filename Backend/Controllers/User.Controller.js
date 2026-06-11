import { uploadOnCloudinary } from "../Middlewares/Cloudinary.js";
import { User } from "../Models/User.Models.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";


export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, message: "Empty search" });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { firstname: { $regex: query, $options: "i" } },
        { lastname: { $regex: query, $options: "i" } },
      ]
    })
      .select("firstname lastname username profileimage coverimage")
      .limit(20);

    return res.status(200).json({ success: true, users });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const getprofile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const formattedUser = {
      _id: user._id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,

      profileimage: user.profileimage?.url || "",
      coverimage: user.coverimage?.url || "",

      bio: user.bio || "",
      liveIn: user.liveIn || "",
      hometown: user.hometown || "",
      relationship: user.relationship || "",
      // dateofBirth: user.dateofBirth || "",
      dateofBirth: user.dateofBirth
  ? user.dateofBirth.toISOString().split("T")[0]
  : "",
      phone: user.phone || "",

      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      friendsCount: user.friends?.length || 0,

      friends: user.friends || [],
      subscriptionPlans: user.subscriptionPlans || [],
    };

    return res.status(200).json({
      success: true,
      user: formattedUser,
    });

  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Get profile error",
    });
  }
};


export const getAllFriends = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const friendId = req.query.friendId;

    const user = await User.findById(userId).populate({
      path: "friends",
      select: "firstname lastname profileimage email",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let selectedFriend = null;
    if (friendId) {
      selectedFriend = user.friends.find(
        (f) => f._id.toString() === friendId
      );

      if (!selectedFriend) {
        return res.status(404).json({
          success: false,
          message: "Friend not found in user's friend list",
        });
      }
    }

    return res.status(200).json({
      success: true,
      totalFriends: user.friends.length,
      selectedFriend, 
      friends: user.friends, 
    });

  } catch (error) {
    console.error("Get Friends Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .select("-password") 
      .populate({
        path: "friends",
        select: "firstname lastname profileimage email",
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("Get User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const getSuggestedPeople = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const excludedIds = [
      currentUser._id,
      ...(currentUser.following || []),
      ...(currentUser.followers || []),
    ];

    const suggestions = await User.find({
      _id: { $nin: excludedIds },
    })
      .select("firstname lastname profileimage coverimage")
      .limit(20);

    return res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions,
    });

  } catch (error) {
    console.error("Suggestion Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const followUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    if (id === currentUserId) {
      return res.status(400).json({ message: "You can't follow yourself." });
    }

    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const alreadyFollowing = currentUser.following.some(
      uid => uid.toString() === id
    );

    if (alreadyFollowing) {
      return res.status(400).json({ message: "Already following this user." });
    }

    currentUser.following.push(id);
    userToFollow.followers.push(currentUserId);

    await currentUser.save();
    await userToFollow.save();

    return res.status(200).json({
      success: true,
      message: "User followed successfully",
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    if (id === currentUserId) {
      return res.status(400).json({ message: "You can't unfollow yourself." });
    }

    const userToUnfollow = await User.findById(id);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const isFollowing = currentUser.following.some(
      uid => uid.toString() === id
    );

    if (!isFollowing) {
      return res.status(400).json({ message: "You are not following this user." });
    }

    currentUser.following = currentUser.following.filter(
      uid => uid.toString() !== id
    );

    userToUnfollow.followers = userToUnfollow.followers.filter(
      uid => uid.toString() !== currentUserId
    );

    await currentUser.save();
    await userToUnfollow.save();

    return res.status(200).json({
      success: true,
      message: "User unfollowed successfully",
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const updateIntro = async (req, res) => {
  try {
    const userId = req.user.id;

    const { liveIn, relationship, dateofBirth, phone, hometown } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (liveIn !== undefined) user.liveIn = liveIn;
    if (relationship !== undefined) user.relationship = relationship;
    if (dateofBirth !== undefined) user.dateofBirth = dateofBirth;
    if (phone !== undefined) user.phone = phone;
    if (hometown !== undefined) user.hometown = hometown;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Intro updated successfully",
      user,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating intro",
    });
  }
};


export const updateProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    const filePath = req.file?.path;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: "Profile image file is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.profileimage?.public_id) {
      try {
        await cloudinary.uploader.destroy(
          user.profileimage.public_id,
          { resource_type: "image" }
        );
      } catch (err) {
        console.log("Old profile image delete failed:", err.message);
      }
    }

    const uploadedImage = await uploadOnCloudinary(filePath);

    if (!uploadedImage) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary upload failed",
      });
    }

    user.profileimage = {
      url: uploadedImage.url,
      public_id: uploadedImage.public_id,
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile photo updated successfully",
      profileimage: user.profileimage,
    });

  } catch (error) {
    console.error("Update Profile Photo Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const updateCoverPhoto = async (req, res) => {
  try {
    const userId = req.user.id;

    const filePath = req.file?.path;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: "Cover image file is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.coverimage?.public_id) {
      try {
        await cloudinary.uploader.destroy(
          user.coverimage.public_id,
          { resource_type: "image" }
        );
      } catch (err) {
        console.log("Old cover image delete failed:", err.message);
      }
    }

    const uploadedImage = await uploadOnCloudinary(filePath);

    if (!uploadedImage) {
      return res.status(500).json({
        success: false,
        message: "Cloudinary upload failed",
      });
    }

    user.coverimage = {
      url: uploadedImage.url,
      public_id: uploadedImage.public_id,
    };

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Cover photo updated successfully",
      coverimage: user.coverimage,
    });

  } catch (error) {
    console.error("Update Cover Photo Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



export const addSubscriptionPlans = async (req, res) => {
  try {
    const userId = req.user.id;
    const { plans } = req.body;

    if (!plans || !Array.isArray(plans) || plans.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Plans are required",
      });
    }

    if (plans.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 plans allowed",
      });
    }

    const seen = new Set();

    for (const plan of plans) {
      if (!plan.name || !plan.price || !plan.duration) {
        return res.status(400).json({
          success: false,
          message: "Each plan must have name, price, duration",
        });
      }

      if (typeof plan.price !== "number" || plan.price <= 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a positive number",
        });
      }

      if (typeof plan.duration !== "number" || plan.duration <= 0) {
        return res.status(400).json({
          success: false,
          message: "Duration must be positive (in days)",
        });
      }

      if (seen.has(plan.name)) {
        return res.status(400).json({
          success: false,
          message: "Duplicate plan names not allowed",
        });
      }

      seen.add(plan.name);
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.subscriptionPlans = plans;

    await user.save();

    return res.json({
      success: true,
      message: "Subscription plans updated",
      subscriptionPlans: user.subscriptionPlans,
    });

  } catch (error) {
    console.error("PLAN ERROR:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const updateLastActive = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      lastActive: new Date(),
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Error updating activity" });
  }
};