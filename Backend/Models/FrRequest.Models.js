import mongoose from "mongoose";

const frRequestSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
    },
   receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
}, { timestamps: true });       

export const FrRequest= mongoose.model("FrRequest", frRequestSchema);