import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

import { connectDB } from "./Config/Db.js";

import authrouter from "./Routes/Auth.Routes.js";
import videorouter from "./Routes/Video.Routes.js";
import userrouter from "./Routes/User.Routes.js";
import frRequestrouter from "./Routes/FrRequest.Routes.js";
import storyrouter from "./Routes/Story.Routes.js";
import reelsrouter from "./Routes/Reels.Routes.js";
import postrouter from "./Routes/Post.Routes.js";
import subscriptionrouter from "./Routes/Subscription.Routes.js";
import paymentRouter from "./Routes/Payment.Routes.js";
import feedrouter from "./Routes/Feed.Routes.js";
import livestreamrouter from "./Routes/LiveStream.Route.js";
import { liveStreamSocket } from "./Config/liveStreamSocket.js";
import marketrouter from "./Routes/Market.Routes.js";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: "https://facebook-frontend-2b6k.onrender.com",
  credentials: true,
}));

app.use("/api/v1/auth", authrouter);
app.use("/api/v1/video", videorouter);
app.use("/api/v1/user", userrouter);
app.use("/api/v1/frRequest", frRequestrouter);
app.use("/api/v1/strory", storyrouter);
app.use("/api/v1/reels", reelsrouter);
app.use("/api/v1/post", postrouter);
app.use("/api/v1/subscription", subscriptionrouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/feed", feedrouter);
app.use("/api/v1/livestream", livestreamrouter);
app.use("/api/v1/market", marketrouter);


const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "https://facebook-frontend-2b6k.onrender.com",
    credentials: true,
  },
});

// Attach socket logic
liveStreamSocket(io);

const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
   console.log("🎂 Birthday Cron Started");
});
