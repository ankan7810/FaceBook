import express from "express";
import isAuth from "../Middlewares/isAuth.js";
import { acceptFriendRequest, deleteFriendRequest, getFriendRequests, getFriends, getSuggestions, rejectFriendRequest, sendFriendRequest, unfriend } from "../Controllers/FrRequest.Controller.js";


const frRequestrouter = express.Router(); 

frRequestrouter.post("/send/:receiverId", isAuth, sendFriendRequest);
frRequestrouter.put("/accept/:requestId", isAuth, acceptFriendRequest);
frRequestrouter.put("/reject/:requestId", isAuth, rejectFriendRequest);
frRequestrouter.delete("/cancel/:requestId", isAuth, deleteFriendRequest);
frRequestrouter.get("/requests", isAuth, getFriendRequests);
frRequestrouter.get("/friends", isAuth, getFriends);
frRequestrouter.put("/unfriend/:friendId", isAuth, unfriend);
frRequestrouter.get("/suggestions", isAuth, getSuggestions);

export default frRequestrouter;