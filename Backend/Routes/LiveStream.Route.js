
import express from "express";
import isAuth from "../Middlewares/isAuth.js";
import { createStream, endStream, getLiveStreams } from "../Controllers/LiveStream.Controller.js";

const livestreamrouter = express.Router();

livestreamrouter.post("/create", isAuth, createStream);
livestreamrouter.post("/end/:streamId", isAuth, endStream);
livestreamrouter.get("/", getLiveStreams);

export default livestreamrouter;