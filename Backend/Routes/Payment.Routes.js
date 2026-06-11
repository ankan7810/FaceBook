import express from "express";
import isAuth from "../Middlewares/isAuth.js";
// import { createOrder } from "../Config/Razorpay.js";
import { createOrder, failPayment, verifyPayment } from "../Controllers/Payment.Controllers.js";


const paymentRouter = express.Router();

paymentRouter.post("/create-order", isAuth, createOrder);
paymentRouter.post("/verify", isAuth, verifyPayment);
paymentRouter.post("/fail", isAuth, failPayment);

export default paymentRouter;