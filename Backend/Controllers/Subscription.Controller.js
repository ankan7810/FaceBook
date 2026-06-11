import mongoose from "mongoose";
import { Subscriber } from "../Models/Subscribe.Models.js";


export const checkSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { creatorId } = req.params;

    let subscription = await Subscriber.findOne({
      subscriber: userId,
      creator: creatorId,
      status: "active",
    });

    if (!subscription) {
      return res.json({ isSubscribed: false });
    }

    if (subscription.endDate < new Date()) {
      subscription.status = "expired";
      await subscription.save();

      return res.json({ isSubscribed: false });
    }

    return res.json({
      isSubscribed: true,
      subscription,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { creatorId } = req.params;

    const existing = await Subscriber.findOne({
      subscriber: userId,
      creator: creatorId,
      status: "active",
    });

    if (existing) {
      return res.json({ success: true, message: "Already subscribed" });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const subscription = await Subscriber.create({
      subscriber: userId,
      creator: creatorId,
      startDate,
      endDate,
      status: "active",
    });

    return res.json({
      success: true,
      subscription,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { creatorId } = req.params;

    const subscription = await Subscriber.findOne({
      subscriber: userId,
      creator: creatorId,
      status: "active",
    });

    if (!subscription) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }

    //  Mark for cancellation at endDate
    subscription.cancelAtPeriodEnd = true;
    subscription.cancelledAt = new Date();

    await subscription.save();

    return res.json({
      success: true,
      message: "Subscription will cancel at period end",
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



export const getUserSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const query = {
      subscriber: req.user.id,
      status: "active",
      endDate: { $gt: new Date() }, 
    };

    const total = await Subscriber.countDocuments(query);

    const subscriptions = await Subscriber.find(query)
      .populate("creator", "username profileimage subscriptionPrice")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    return res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      subscriptions,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const getCreatorSubscribers = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    //  Authorization check
    if (req.user.id !== creatorId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const query = {
      creator: creatorId,
      status: "active",
      endDate: { $gt: new Date() },
    };

    const total = await Subscriber.countDocuments(query);

    const subscribers = await Subscriber.find(query)
      .populate("subscriber", "username profileimage")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    return res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      subscribers,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};