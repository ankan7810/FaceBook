import crypto from "crypto";
import mongoose from "mongoose";
import { Payment } from "../Models/Payment.Models.js";
import { Subscriber } from "../Models/Subscribe.Models.js";
import { User } from "../Models/User.Models.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


export const createOrder = async (req, res) => {
  try {
    const { creatorId, plan } = req.body;

    if (!creatorId || !plan) {
      return res.status(400).json({
        success: false,
        message: "creatorId and plan are required",
      });
    }

    let amount;

    if (plan === "quarterly") {
      amount = 39900; // ₹399
    } else if (plan === "yearly") {
      amount = 59900; // ₹599
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid plan selected",
      });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    await Payment.create({
      user: req.user.id,
      creator: creatorId,
      razorpay_order_id: order.id,
      amount,
      plan,
      status: "created",
    });

    return res.json({
      success: true,
      order,
    });

  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};


export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const payment = await Payment.findOne({
      razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status === "paid") {
      return res.json({
        success: true,
        message: "Already processed",
      });
    }

    payment.razorpay_payment_id = razorpay_payment_id;
    payment.razorpay_signature = razorpay_signature;
    payment.status = "paid";
    await payment.save();

    const existing = await Subscriber.findOne({
      subscriber: payment.user,
      creator: payment.creator,
      status: "active",
    });

    if (existing) {
      return res.json({
        success: true,
        message: "Already subscribed",
      });
    }

    const startDate = new Date();
    const endDate = new Date();

    if (payment.plan === "quarterly") {
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (payment.plan === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    await Subscriber.create({
      subscriber: payment.user,
      creator: payment.creator,
      startDate,
      endDate,
      status: "active",
      payment: payment._id,
      priceAtPurchase: payment.amount / 100,
    });

    await User.findByIdAndUpdate(payment.creator, {
      $inc: { subscribersCount: 1 },
    });

    return res.json({
      success: true,
      message: "Subscription activated 🎉",
    });

  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Verification failed",
      error: error.message,
    });
  }
};


export const failPayment = async (req, res) => {
  try {
    const { razorpay_order_id } = req.body;

    if (!razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Order ID required",
      });
    }

    await Payment.findOneAndUpdate(
      { razorpay_order_id },
      { status: "failed" }
    );

    return res.json({
      success: true,
      message: "Payment marked as failed",
    });

  } catch (error) {
    console.error("FAIL PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update payment",
      error: error.message,
    });
  }
};