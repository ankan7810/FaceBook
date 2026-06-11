
import dotenv from "dotenv";
import { Payment } from "../Models/Payment.Models.js";

dotenv.config();

export const createOrder = async (req, res) => {
  try {
    const { creatorId, plan } = req.body;

    let amount;

    if (plan === "quarterly") amount = 39900;
    else if (plan === "yearly") amount = 59900;

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
    });

    await Payment.create({
      user: req.user.id,
      creator: creatorId,
      razorpay_order_id: order.id,
      amount,
      plan,
      status: "created",
    });

    res.json({ success: true, order });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};