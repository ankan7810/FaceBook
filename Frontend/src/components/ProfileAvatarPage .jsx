import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1";

const ProfileAvatar = ({ userId, size = 40 }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/user/profile/${userId}`,
          { withCredentials: true }
        );

        const user = res.data.user;

        setProfile({
          ...user,
          profileimage: user?.profileimage || "",
        });
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    fetchProfile();
  }, [userId]);

  if (!profile) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "#ddd",
        }}
      />
    );
  }

  return (
    <img
      src={
        profile.profileimage ||
        `https://ui-avatars.com/api/?name=${profile.username}`
      }
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
      }}
      onError={(e) => {
        e.target.src = `https://ui-avatars.com/api/?name=${profile.username}`;
      }}
    />
  );
};

export default ProfileAvatar;