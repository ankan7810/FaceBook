import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { AUTH_BASE_URL } from "@/Utils/Constant";
import { setLoading } from "@/redux/authSlice";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(""); // ✅ only this added

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const email = localStorage.getItem("resetEmail");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      return setPasswordError("Password must be at least 6 characters long");
    }

    setPasswordError("");

    if (!email) {
      return toast.error("Session expired. Please verify OTP again");
    }

    dispatch(setLoading(true));

    try {
      const res = await axios.post(
        `${AUTH_BASE_URL}/reset-password`,
        {
          email,
          newPassword: password,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      toast.success(res.data.message || "Password reset successfully");

      localStorage.removeItem("resetEmail");
      navigate("/login");

    } catch (err) {
      toast.error(err.response?.data?.message || "Password reset failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold text-center mb-4">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {email && (
            <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
              Resetting password for: <span className="font-medium">{email}</span>
            </div>
          )}

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (e.target.value.length < 6) {
                  setPasswordError("Password must be at least 6 characters long");
                } else {
                  setPasswordError("");
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-12 focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>

          {/* ✅ ONLY THIS ERROR */}
          {passwordError && (
            <div className="text-red-600 text-sm">
              {passwordError}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold cursor-pointer transition "
          >
            Reset Password
          </button>

        </form>
      </div>
    </div>
  );
};

export default ResetPassword;