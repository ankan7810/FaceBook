import {User} from '../Models/User.Models.js';
import bcrypt from 'bcrypt';
import { genToken } from '../Config/Token.js';
import { sendOtpMail, sendRegistertationMail } from '../Config/Mail.js';
import {uploadOnCloudinary} from '../Middlewares/Cloudinary.js';

export const Register = async (req, res) => {
  try {
    let {
      firstname,
      lastname,
      username,
      email,
      password,
      bio,
      phone,
      relationship,
      hometown,
      dateofBirth
    } = req.body;

   
    if (
      !firstname ||
      !lastname ||
      !username ||
      !email ||
      !password ||
      !bio ||
      !phone ||
      !relationship ||
      !hometown ||
      !dateofBirth
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    email = email.toLowerCase();

    let normalizedPhone = phone.toString().trim();
    const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;

    if (!phoneRegex.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid Indian mobile number"
      });
    }

    normalizedPhone = normalizedPhone.replace(/^(\+91|91)/, "");

    const [existingEmail, existingPhone, existingUsername] =
      await Promise.all([
        User.findOne({ email }),
        User.findOne({ phone: normalizedPhone }),
        User.findOne({ username })
      ]);

    if (existingEmail)
      return res.status(400).json({ success: false, message: "Email already exists" });

    if (existingPhone)
      return res.status(400).json({ success: false, message: "Phone already exists" });

    if (existingUsername)
      return res.status(400).json({ success: false, message: "Username already taken" });

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    if (!req.files?.profileimage || !req.files?.coverimage) {
      return res.status(400).json({
        success: false,
        message: "Both profile and cover images are required"
      });
    }

    const profileFile = req.files.profileimage[0];
    const coverFile = req.files.coverimage[0];

    const [profileUpload, coverUpload] = await Promise.all([
      uploadOnCloudinary(profileFile.path),
      uploadOnCloudinary(coverFile.path)
    ]);

    if (!profileUpload?.url || !coverUpload?.url) {
      return res.status(500).json({
        success: false,
        message: "Image upload failed"
      });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user (NO subscriptionPlans here)
    const newUser = await User.create({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
      bio,
      relationship,
      hometown,
      dateofBirth,
      phone: normalizedPhone,
      profileimage: {
        url: profileUpload.url,
        public_id: profileUpload.public_id
      },
      coverimage: {
        url: coverUpload.url,
        public_id: coverUpload.public_id
      }
    });

    // ✅ Generate token
    const token = await genToken(newUser._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 15 * 24 * 60 * 60 * 1000
    });

    // ✅ Send mail
    const fullName =
      firstname.charAt(0).toUpperCase() +
      firstname.slice(1) +
      " " +
      lastname.charAt(0).toUpperCase() +
      lastname.slice(1);

    sendRegistertationMail(email, fullName).catch(() => {});

    newUser.password = undefined;

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
      token
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const login = async (req, res) => {
  try {
    let { email, phone, password } = req.body;

    if ((!email && !phone) || (email && phone)) {
      return res.status(400).json({
        success: false,
        message: "Provide either email OR phone"
      });
    }

    let user;

    if (email) {
      email = email.toLowerCase();
      user = await User.findOne({ email });
    } else {
      const normalizedPhone = phone.replace(/^(\+91|91)/, "");
      user = await User.findOne({ phone: normalizedPhone });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = await genToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 15 * 24 * 60 * 60 * 1000
    });

    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};  

export const logout = async (req, res) => {
        try {
            res.clearCookie('token');
            return res.status(200).json({ message: 'User logged out successfully' });
        } catch (error) {
            return res.status(400).json({ message: `Logout error: ${error.message}` });
        }
    }


export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetOtp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.isOtpVerified = false;
    await user.save();
    await sendOtpMail(email, otp);
    return res.status(200).json({ message: "otp sent successfully" });
  } catch (error) {
    
    return res.status(500).json(`send otp error ${error}`);
  }
}; 

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.resetOtp != otp ) {
      return res.status(400).json({ message: "invalid otp" });
    }
    if (user.otpExpires < Date.now()) {
        return res.status(400).json({ message: "expired otp" });
    }
    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    await user.save();
    return res.status(200).json({ message: "otp verify successfully" });
  } 
  catch (error) {
    return res.status(500).json(`verify otp error ${error}`);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "otp verification required" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.isOtpVerified = false;
    await user.save();
    return res.status(200).json({ message: "password reset successfully" });
  } catch (error) {
    return res.status(500).json(`reset password error ${error}`);
  }
};


export const googleAuth = async (req, res) => {
  try {
    const { username, email, phone } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username,
        email,
        phone,
      });
    }

    const token = await genToken(user._id);
    res.cookie("token", token, {
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json(`googleAuth error ${error}`);
  }
};
