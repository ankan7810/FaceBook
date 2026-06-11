import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  razorpay_order_id: String,
  razorpay_payment_id: String,
  razorpay_signature: String,

  amount: Number,
  status: {
    type: String,
    enum: ["created", "paid", "failed"],
    default: "created",
  },

  plan: String,
}, { timestamps: true });

export const Payment = mongoose.model("Payment", paymentSchema);