import { LiveStream } from "../Models/LiveStream.Model.js";

export const createStream = async (req, res) => {
  try {
    const stream = await LiveStream.create({
      host: req.user.id,
      title: req.body.title,
    });

    res.json({ success: true, stream });
  } catch (err) {
    res.status(500).json({ message: "Create stream failed" });
  }
};

export const endStream = async (req, res) => {
  try {
    const { streamId } = req.params;

    await LiveStream.findByIdAndUpdate(streamId, {
      isLive: false,
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "End stream failed" });
  }
};

export const getLiveStreams = async (req, res) => {
  try {
    const streams = await LiveStream.find()
      .sort({ createdAt: -1 }) // newest first
      .limit(10)               // only last 10
      .populate("host", "firstname profileimage");

    res.json(streams);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch streams" });
  }
};