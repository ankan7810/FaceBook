import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
  //   contentType: {
  //     type: String,
  //     enum: ["text", "image", "Video"],
  //     required: true,
  //   },

    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true,
    },

    repliesCount: {
      type: Number,
      default: 0,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", commentSchema);