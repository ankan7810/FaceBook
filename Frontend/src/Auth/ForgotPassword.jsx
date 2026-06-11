import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { AUTH_BASE_URL } from "@/Utils/Constant.js";
import { setLoading, setError } from "@/redux/authSlice";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      return toast.error("Email is required");
    }

    dispatch(setLoading(true));

    try {
      const res = await axios.post(
        `${AUTH_BASE_URL}/send-otp`,
        { email },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      // ✅ Ensure success
      if (res.status === 200) {
        toast.success(res.data.message || "OTP sent successfully");

        // 🔥 Store email (fix refresh issue)
        localStorage.setItem("resetEmail", email);

        // ✅ Navigate to verify page
        navigate("/verify-otp");
      }

    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP";
      dispatch(setError(msg));
      toast.error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="flex flex-col md:flex-row md:max-w-5xl gap-12 items-center">

        {/* Left Section */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-blue-600 text-6xl font-bold">facebook</h1>
          <p className="text-xl mt-4 text-gray-700">
            Find your account and reset your password.
          </p>
        </div>

        {/* Right Section */}
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-xl font-bold text-center mb-2">
            Find Your Account
          </h2>

          <p className="text-sm text-gray-500 text-center mb-5">
            Enter your email to receive a verification code.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email Input */}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-lg font-semibold w-full cursor-pointer"
            >
              Send OTP
            </button>

            {/* Links */}
            <div className="flex justify-between text-sm">
              <Link to="/login" className="text-blue-600 hover:underline">
                Back to login
              </Link>

              <Link to="/signup" className="text-blue-600 hover:underline">
                Create new account
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;