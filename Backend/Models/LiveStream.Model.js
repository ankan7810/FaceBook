// Models/LiveStream.js
import mongoose from "mongoose";

const liveStreamSchema = new mongoose.Schema({
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: String,
  isLive: {
    type: Boolean,
    default: true,
  },
  viewers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
}, { timestamps: true });

export const LiveStream = mongoose.model("LiveStream", liveStreamSchema);