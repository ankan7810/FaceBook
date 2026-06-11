import express from "express";
import isAuth from "../Middlewares/isAuth.js";
import { cancelSubscription, checkSubscription, createSubscription, getCreatorSubscribers, getUserSubscriptions } from "../Controllers/Subscription.Controller.js";

const subscriptionrouter = express.Router();

subscriptionrouter.get("/check/:creatorId", isAuth, checkSubscription);
subscriptionrouter.patch("/cancel/:creatorId", isAuth, cancelSubscription);
subscriptionrouter.get("/getsubscriptions", isAuth, getUserSubscriptions);
subscriptionrouter.get("/subscribers/:creatorId", isAuth, getCreatorSubscribers);  
subscriptionrouter.post("/subscribe/:creatorId", isAuth, createSubscription);

export default subscriptionrouter; 