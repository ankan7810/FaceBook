import { FrRequest } from "../Models/FrRequest.Models.js";
import { User } from "../Models/User.Models.js";
import mongoose from "mongoose";


export const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.params;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID missing",
      });
    }

    if (senderId.toString() === receiverId) {
      return res.status(400).json({
        message: "Cannot send request to yourself",
      });
    }

    const newRequest = await FrRequest.create({
      senderId,
      receiverId,   // ✅ guaranteed valid
      status: "pending",
    });

    return res.status(201).json({
      success: true,
      request: newRequest,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending request" });
  }
};


export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = String(req.user._id);

    if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID",
      });
    }

    const frRequest = await FrRequest.findById(requestId);

    if (!frRequest) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found",
      });
    }

    // 🔐 Authorization check
    if (frRequest.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to accept this request",
      });
    }

    const senderId = frRequest.senderId.toString();

    // 🤝 Add both users to each other's friends list
    await Promise.all([
      User.findByIdAndUpdate(senderId, {
        $addToSet: { friends: userId },
      }),
      User.findByIdAndUpdate(userId, {
        $addToSet: { friends: senderId },
      }),

      // 🗑️ Delete request after accept
      FrRequest.findByIdAndDelete(requestId),
    ]);

    return res.status(200).json({
      success: true,
      message: "Friend request accepted",
    });

  } catch (error) {
    console.error("Accept Friend Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const getSuggestions = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const currentUser = await User.findById(userId).select("friends");

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const pendingRequests = await FrRequest.find({
      $or: [
        { senderId: userId, status: "pending" },
        { receiverId: userId, status: "pending" },
      ],
    }).select("senderId receiverId");

    const requestedUserIds = pendingRequests.map((reqItem) =>
      reqItem.senderId.equals(userId)
        ? reqItem.receiverId
        : reqItem.senderId
    );

    const excludeSet = new Set([
      userId.toString(),
      ...currentUser.friends.map((id) => id.toString()),
      ...requestedUserIds.map((id) => id.toString()),
    ]);

    const excludeIds = [...excludeSet].map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const suggestions = await User.find({
      _id: { $nin: excludeIds },
    })
      .select("username profileimage")
      .limit(20);

    return res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions,
    });

  } catch (error) {
    console.error("Suggestions Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = String(req.user._id);

    console.log("Reject requestId:", requestId);

    // ✅ validate id
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID",
      });
    }

    const frRequest = await FrRequest.findById(requestId);

    if (!frRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (frRequest.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await FrRequest.findByIdAndDelete(requestId);

    return res.json({
      success: true,
      message: "Friend request rejected",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const deleteFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = String(req.user._id);

    console.log("Cancel requestId:", requestId);

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request ID",
      });
    }

    const frRequest = await FrRequest.findById(requestId);

    if (!frRequest) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (frRequest.senderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this request",
      });
    }

    await FrRequest.findByIdAndDelete(requestId);

    return res.status(200).json({
      success: true,
      message: "Request cancelled successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const getFriendRequests = async (req, res) => {
  try {
    const userId = String(req.user._id);

    const incoming = await FrRequest.find({
      receiverId: userId,
      status: "pending",
    }).populate("senderId", "username profileimage");

    const outgoing = await FrRequest.find({
      senderId: userId,
      status: "pending",
    }).populate("receiverId", "username profileimage");

    return res.json({
      incoming,
      outgoing,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching requests" });
  }
};


export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("friends", "username profileimage lastActive");

    res.status(200).json({
      friends: user.friends,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching friends" });
  }
};

export const unfriend = async (req, res) => {
  try {
    const userId = String(req.user._id);
    const friendId = String(req.params.friendId);

    await Promise.all([
      User.findByIdAndUpdate(userId, {
        $pull: { friends: friendId },
      }),
      User.findByIdAndUpdate(friendId, {
        $pull: { friends: userId },
      }),

      FrRequest.deleteMany({
        $or: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Unfriended successfully",
    });

  } catch (error) {
    console.error("Unfriend Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};