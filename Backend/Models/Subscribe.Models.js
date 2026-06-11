import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
  subscriber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  startDate: {
    type: Date,
    default: Date.now
  },

  endDate: {
    type: Date,
    required: true
  },

  duration: {
    type: Number, // days
    default: 30
  },

  status: {
    type: String,
    enum: ["active", "expired", "cancelled"],
    default: "active"
  },

  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: true
  },

  autoRenew: {
    type: Boolean,
    default: false
  },

  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },

  priceAtPurchase: {
    type: Number,
    required: true
  }

}, { timestamps: true });


subscriberSchema.index(
  { subscriber: 1, creator: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" } }
);

subscriberSchema.index({ creator: 1, status: 1 });
subscriberSchema.index({ subscriber: 1, status: 1 });
subscriberSchema.index({ endDate: 1, status: 1 });

export const Subscriber = mongoose.model("Subscriber", subscriberSchema);