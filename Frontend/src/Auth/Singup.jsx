import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AUTH_BASE_URL } from "@/Utils/Constant.js";
import { setLoading, setError } from "@/redux/authSlice";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { error } = useSelector((state) => state.auth); // ✅ get error

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    bio: "",
    phone: "",
    relationship: "",
    hometown: "",
    dateofBirth: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [relationship, setRelationship] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const updateDateOfBirth = (day, month, year) => {
    if (day && month && year) {
      const formatted = `${year}-${month}-${day}`;
      setFormData((prev) => ({
        ...prev,
        dateofBirth: formatted,
      }));
    }
  };

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) setProfilePreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    setCoverImage(file);
    if (file) setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));

    try {
      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      data.append("profileimage", profileImage);
      data.append("coverimage", coverImage);

      const res = await axios.post(`${AUTH_BASE_URL}/register`, data, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (res.data.success) {
        navigate("/login");
      } else {
        dispatch(setError(res.data.message));
      }
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Signup failed"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-10">
      <h1 className="text-blue-600 text-5xl font-bold mb-6">facebook</h1>

      <div className="bg-white p-8 rounded-xl shadow-lg w-[500px]">
        <h2 className="text-2xl font-bold text-center mb-1">
          Create a new account
        </h2>
        <p className="text-center text-gray-500 mb-4">
          It's quick and easy.
        </p>
        <hr className="mb-5" />

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div className="flex gap-3">
            <input name="firstname" placeholder="First name" onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            <input name="lastname" placeholder="Last name" onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>

          <input name="username" placeholder="Username" onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />

          <input name="email" placeholder="Email" onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />

          <input name="phone" placeholder="Phone number" onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />

          {/* Password */}
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="password"
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-12 focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
            >
              {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>

          <input name="hometown" placeholder="Hometown" onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />

          {/* Relationship */}
          <div>
            <label className="text-sm text-gray-700 mb-2 block">Relationship</label>
            <div className="grid grid-cols-2 gap-2">
              {["Single", "In a relationship", "Married", "Divorced"].map((status) => (
                <label key={status}
                  className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer 
                  ${relationship === status ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}>
                  <input
                    type="radio"
                    name="relationship"
                    value={status}
                    checked={relationship === status}
                    onChange={(e) => {
                      setRelationship(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        relationship: e.target.value,
                      }));
                    }}
                  />
                  <span className="text-sm">{status}</span>
                </label>
              ))}
            </div>
          </div>

          <textarea name="bio" placeholder="Bio" rows={3} onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500" />

          {/* DOB */}
          <div>
            <label className="text-sm text-gray-700 mb-1 block">Date of birth</label>
            <div className="flex gap-2">
              <select value={dobDay}
                onChange={(e) => {
                  setDobDay(e.target.value);
                  updateDateOfBirth(e.target.value, dobMonth, dobYear);
                }}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg">
                <option value="">Day</option>
                {[...Array(31)].map((_, i) => (
                  <option key={i} value={String(i + 1).padStart(2, "0")}>{i + 1}</option>
                ))}
              </select>

              <select value={dobMonth}
                onChange={(e) => {
                  setDobMonth(e.target.value);
                  updateDateOfBirth(dobDay, e.target.value, dobYear);
                }}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg">
                <option value="">Month</option>
                {[
                  { label: "Jan", value: "01" }, { label: "Feb", value: "02" },
                  { label: "Mar", value: "03" }, { label: "Apr", value: "04" },
                  { label: "May", value: "05" }, { label: "Jun", value: "06" },
                  { label: "Jul", value: "07" }, { label: "Aug", value: "08" },
                  { label: "Sep", value: "09" }, { label: "Oct", value: "10" },
                  { label: "Nov", value: "11" }, { label: "Dec", value: "12" },
                ].map((m, i) => (
                  <option key={i} value={m.value}>{m.label}</option>
                ))}
              </select>

              <select value={dobYear}
                onChange={(e) => {
                  setDobYear(e.target.value);
                  updateDateOfBirth(dobDay, dobMonth, e.target.value);
                }}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg">
                <option value="">Year</option>
                {[...Array(100)].map((_, i) => (
                  <option key={i} value={String(2026 - i)}>{2026 - i}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Profile Image */}
          <input type="file" accept="image/*" onChange={handleProfileChange}
            className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50" />

          {/* Cover Image */}
          <input type="file" accept="image/*" onChange={handleCoverChange}
            className="w-full border border-gray-300 rounded-lg p-2 bg-gray-50" />

          {/* ✅ ERROR DIV (only when error exists) */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-600 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg w-full text-lg">
            Sign Up
          </button>

          <Link to="/login" className="text-blue-600 text-center block text-sm hover:underline">
            Already have an account?
          </Link>

        </form>
        <div className="flex justify-center mt-6 border-4  border-gray-300 border-radius-md p-3 rounded-md cursor=pointer">
          <button>
            Sign Up with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;