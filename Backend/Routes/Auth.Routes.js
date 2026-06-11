import express from 'express';
import { googleAuth, login, logout, Register, resetPassword, sendOtp, verifyOtp } from '../Controllers/Auth.Controller.js';
import { upload } from '../Middlewares/Multer.js';

const authrouter = express.Router();

authrouter.post('/register',upload.fields([{ name: 'profileimage', maxCount: 1 }, { name: 'coverimage', maxCount: 1 }]), Register);
authrouter.post('/login', login);
authrouter.post('/logout', logout);
authrouter.post('/send-otp', sendOtp);
authrouter.post('/verify-otp', verifyOtp);
authrouter.post('/reset-password', resetPassword);
authrouter.post('/Google-auth', googleAuth);

export default authrouter;
