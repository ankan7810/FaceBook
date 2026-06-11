import mongoose from "mongoose";

const marketSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    productImage: {
      url: {
        type: String,
        required: true,
      },

      public_id: {
        type: String,
        required: true,
      },
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isSold: {
      type: Boolean,
      default: false,
    },
    type: {
  type: String,
},
  },
  { timestamps: true },
);

export const Market = mongoose.model("Market", marketSchema);
