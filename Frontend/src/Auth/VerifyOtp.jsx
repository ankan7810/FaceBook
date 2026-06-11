import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { AUTH_BASE_URL } from "@/Utils/Constant";
import { setLoading, setError } from "@/redux/authSlice";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // ✅ FIX: get email from localStorage (safe)
  const email = localStorage.getItem("resetEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      return toast.error("OTP is required");
    }

    if (!email) {
      return toast.error("Session expired. Please try again.");
    }

    dispatch(setLoading(true));

    try {
      const res = await axios.post(
        `${AUTH_BASE_URL}/verify-otp`,
        { email, otp },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      // ✅ Only navigate on success
      if (res.status === 200) {
        toast.success(res.data.message || "OTP verified");

        navigate("/reset-password");
      }

    } catch (err) {
      const msg =
        err.response?.data?.message || "OTP verification failed";

      dispatch(setError(msg));
      toast.error(msg); // ❌ shows failed message properly
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-center mb-4">
          Verify OTP
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* OTP Input */}
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold cursor-pointer transition"
          >
            Verify OTP
          </button>

        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;