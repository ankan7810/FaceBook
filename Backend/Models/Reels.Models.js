import mongoose from "mongoose";

const reelSchema = new mongoose.Schema({
  video: {
    type: String,
    required: true
  },

  thumbnail: {
    type: String
  },

  caption: {
    type: String,
    trim: true,
    maxlength: 500
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  views: {
    type: Number,
    default: 0
  },

  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  commentsCount: {
    type: Number,
    default: 0
  },

  shareCount: {
    type: Number,
    default: 0
  },

  isDeleted: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });


reelSchema.index({ createdAt: -1 });
reelSchema.index({ owner: 1, createdAt: -1 });

export const Reel = mongoose.model("Reel", reelSchema);