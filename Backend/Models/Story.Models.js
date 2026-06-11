import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },

  storyGroupId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
  },

  type: {
    type: String,
    enum: ["image","video"],
    required: true,
  },

  media: {
    type: String,
    required: true,
  },

  sequence: {  
    type: Number,
    default: 0
  },

  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],

  views: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],

  public_id: {  
  type: String,
  required: true,
},
thumbnail: {
  type: String,
}


}, { timestamps: true });

storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export const Story = mongoose.model("Story", storySchema);

// module.exports = Story;