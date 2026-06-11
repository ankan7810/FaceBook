import express from "express";
import isAuth from "../Middlewares/isAuth.js";
import { getFeed } from "../Controllers/Feed.Controller.js";

const feedrouter = express.Router();

feedrouter.get("/", isAuth, getFeed);

export default feedrouter;