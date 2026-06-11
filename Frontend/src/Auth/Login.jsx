import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { AUTH_BASE_URL } from "@/Utils/Constant.js";
import { setUser, setLoading, setError } from "@/redux/authSlice.js";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { error, loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 🔥 clear error when user types
    if (error) dispatch(setError(null));

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.emailOrPhone || !formData.password) {
      return dispatch(setError("All fields are required"));
    }

    dispatch(setLoading(true));

    try {
      let payload = {
        password: formData.password,
      };

      if (formData.emailOrPhone.includes("@")) {
        payload.email = formData.emailOrPhone;
      } else {
        payload.phone = formData.emailOrPhone;
      }

      const res = await axios.post(`${AUTH_BASE_URL}/login`, payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

if (res.data.success) {
  let user = res.data.user;

  console.log("LOGIN RESPONSE:", res.data);

  // ✅ normalize id (IMPORTANT)
  user = {
    ...user,
    _id: user?._id || user?.id || user?.userId,
  };

  if (!user || !user._id) {
    console.error("User invalid from backend:", user);
    toast.error("Login failed: invalid user");
    return;
  }

  // 🔥 👉 ADD HERE (THIS IS THE LINE YOU ASKED ABOUT)
  localStorage.setItem("user", JSON.stringify(user));

  // Redux update
  dispatch(setUser(user));
  dispatch(setError(null));

  console.log("USER SAVED:", user);

  toast.success(res.data.message);
  navigate("/");
}
      else {
        dispatch(setError(res.data.message));
        toast.error(res.data.message);
      }

    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
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
            Connect and share with people in your life.
          </p>
        </div>

        {/* Right Section */}
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email / Phone */}
            <input
              type="text"
              name="emailOrPhone"
              placeholder="Email address or phone number"
              value={formData.emailOrPhone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FaRegEye className="cursor-pointer"/> : <FaRegEyeSlash className="cursor-pointer"/>}
              </button>
            </div>

            {/* 🔴 Error Message Box */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-lg font-semibold text-lg w-full disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

            {/* Forgot Password */}
            <Link
              to="/forgot-password"
              className="text-blue-600 text-center block text-sm hover:underline"
            >
              Forgotten password?
            </Link>

            <hr className="my-4" />

            {/* Signup Button */}
            <Link to="/signup">
              <button
                type="button"
                className="bg-green-600 hover:bg-green-700 transition text-white py-3 rounded-lg font-semibold w-full cursor-pointer"
              >
                Create new account
              </button>
            </Link>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
