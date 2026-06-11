import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    lastBirthdayMailSent: {
  type: Date,
},
    bio: {
      type: String,
    },
    profileimage: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    coverimage: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    liveIn: {
      type: String,
    },
    relationship: {
      type: String,
      enum: ["Single", "In a relationship", "Married", "Divorced"],
    },
    hometown: {
      type: String,
    },
    dateofBirth: {
      type: Date,
      required: true,
    },
    password: {
      type: String,
      // required: true,
    },
    subscriptionPrice: {
      type: Number,
      default: 0,
    },
    subscribersCount: {
      type: Number,
      default: 0,
    },
    subscriptionPlans: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        duration: {
          type: Number,
          required: true, // in days
        },
      },
    ],
    friendRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    sentRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    resetOtp: {
      type: String,
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    otpExpires: {
      type: Date,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
