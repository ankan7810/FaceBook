import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(
    {
        path:"./.env"
    }
);


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

console.log("EMAIL:", process.env.EMAIL);
console.log("PASSWORD EXISTS:", !!process.env.EMAIL_PASSWORD);

transporter.verify((error, success) => {
  if (error) {
    console.log("Mail Server Error:", error);
  } else {
    console.log("Mail Server Connected");
  }
});

export const sendOtpMail = async (email, otp) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Your OTP",
            text: `Your OTP is ${otp}, Your OTP is valid for 5 minutes. Please do not share it with anyone.`,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
        // return res.status(500).json({ message: `OTP email error: ${error.message}` });
        console.log("Send mail error is",error.message);
    }
};

export const sendRegistertationMail = async (email, name) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Welcome !!",
            text: `Welcome to VideHub, ${name}! Please verify your email to continue.`,
        };
        await transporter.sendMail(mailOptions);
    } catch (error) {
       return resizeBy.status(500).json({ message: `Registration email error: ${error.message}` });
    }
};
