import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import {
  Home,
  Video,
  ShoppingBag,
  Users
} from "lucide-react";
import { SlLogout } from "react-icons/sl";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux/authSlice";
import { CiStreamOn } from "react-icons/ci";
import { useSelector } from "react-redux";
import { FaCircleUser } from "react-icons/fa6";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [hovered, setHovered] = useState(null);
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("home");

  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  const [isNewUser, setIsNewUser] = useState(false);

useEffect(() => {
  const firstVisit = localStorage.getItem("firstVisit");

  if (!firstVisit) {
    localStorage.setItem("firstVisit", "true");
    setIsNewUser(true);

    // Stop highlighting after 30 seconds
    setTimeout(() => {
      setIsNewUser(false);
    }, 30000);
  }
}, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        const res = await axios.get(
          `${BASE_URL}/user/search?query=${query}`,
          { withCredentials: true }
        );

        setResults(res.data.users);
        setShowDropdown(true);

      } catch (err) {
        console.log(err);
      }
    }, 400); // debounce

    return () => clearTimeout(delay);
  }, [query]);

  const handleNavigation = (tab) => {
    setActiveTab(tab);

    switch (tab) {
      case "home":
        navigate("/");
        break;
      case "video":
        navigate("/reels");
        break;
      case "market":
        navigate("/market");
        break;
      case "groups":
        navigate("/friends");
        break;
    }
  };

  const handleLogout = async () => {
  try {
    await axios.post(
      `${BASE_URL}/auth/logout`,
      {},
      { withCredentials: true }
    );

    // Clear localStorage
    localStorage.removeItem("user");

    // Clear Redux
    dispatch(logoutUser());

    toast.success("Logged out successfully");

    navigate("/login", { replace: true });

  } catch (error) {
    toast.error(
      error.response?.data?.message || "Logout failed"
    );
  }
};

  return (
    <div style={styles.navbar(isDark)}>
      {/* LEFT */}
      <div style={styles.left}>
        <div onClick={() => navigate("/")} style={styles.logo}>
          SocialX
        </div>

        <div style={styles.search(isDark)}>
          <input
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            style={styles.input(isDark)}
          />
          {showDropdown && results.length > 0 && (
            <div style={styles.dropdown(isDark)}>
              {results.map((user) => (
                <div
                  key={user._id}
                  style={styles.resultItem}
                  onClick={() => {
                    navigate(`/profile/${user._id}`);
                    setShowDropdown(false);
                    setQuery("");
                  }}
                >
                  <img
                    src={user.profileimage?.url || "/default.png"}
                    style={styles.avatar}
                  />

                  <div>
                    <div style={styles.name}>
                      {user.firstname} {user.lastname}
                    </div>
                    <div style={styles.username}>
                      @{user.username}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CENTER */}
      <div style={styles.center}>
        {[
          { icon: <Home size={22} />, key: "home", label: "Home" },
          { icon: <Video size={22} />, key: "video", label: "Reels" },
          { icon: <ShoppingBag size={22} />, key: "market", label: "Market" },
          { icon: <Users size={22} />, key: "groups", label: "Friends" },
        ].map((item) => (
          <div
            key={item.key}
            style={{ position: "relative" }}
            onMouseEnter={() => setHovered(item.key)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              style={styles.iconBox(activeTab === item.key, isDark)}
              onClick={() => handleNavigation(item.key)}
            >
              {item.icon}
            </div>

            {/* ✅ Tooltip */}
            {hovered === item.key && (
              <div style={styles.tooltip(isDark)}>
                {item.label}
              </div>
            )}
          </div>
        ))}
      </div>

     {/* RIGHT */}
<div style={styles.right}>
  {[
    {
      key: "theme",
      label: "Theme",
      element: <ThemeToggle />,
    },
    {
      key: "live",
      label: "Live Stream",
      element: (
        <div
          style={styles.circleBtn(isDark)}
          onClick={() => navigate("/live")}
        >
          <CiStreamOn size={18} />
        </div>
      ),
    },
    {
      key: "logout",
      label: "Logout",
      element: (
        <div
  style={{
    ...styles.circleBtns(isDark),
    ...(isNewUser ? styles.newUserLogout : {})
  }}
  onClick={handleLogout}
>
  <SlLogout size={18} />
</div>
      ),
    },
    {
      key: "profile",
      label: "Profile",
      element: (
        <div
          style={styles.profile}
          onClick={() => navigate(`/profile/${user?._id}`)}
        >
          <FaCircleUser
            size={30}
            color={isDark ? "white" : "#1877f2"}
          />
        </div>
      ),
    },
  ].map((item) => (
    <div
      key={item.key}
      style={{ position: "relative" }}
      onMouseEnter={() => setHovered(item.key)}
      onMouseLeave={() => setHovered(null)}
    >
      {item.element}

      {hovered === item.key && (
        <div style={styles.tooltip(isDark)}>
          {item.label}
        </div>
      )}
    </div>
  ))}
</div>

    </div>
  );
};

export default Navbar;

const styles = {
  navbar: (dark) => ({
    height: "64px",
    backdropFilter: "blur(14px)",
    background: dark
      ? "rgba(36,37,38,0.8)"
      : "rgba(255,255,255,0.75)",
    borderBottom: dark
      ? "1px solid rgba(255,255,255,0.08)"
      : "1px solid rgba(0,0,0,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  }),

  left: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  logo: {
    fontSize: "24px",
    fontWeight: "700",
    background: "linear-gradient(45deg, #1877f2, #42a5f5)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    cursor: "pointer",
  },

  search: (dark) => ({
    background: dark ? "#3a3b3c" : "#f0f2f5",
    padding: "8px 14px",
    borderRadius: "999px",
    width: "240px",
    transition: "0.3s",
    position: "relative",
  }),

  input: (dark) => ({
    border: "none",
    outline: "none",
    width: "100%",
    background: "transparent",
    color: dark ? "#fff" : "#000",
    fontSize: "14px",
  }),

  center: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "400px", // 👈 controls total spread
  },

  iconBox: (active, dark) => ({
    padding: "10px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.25s ease",
    color: active ? "#1877f2" : dark ? "#ccc" : "#555",
    background: active
      ? "rgba(24,119,242,0.15)"
      : "transparent",
    boxShadow: active
      ? "0 4px 12px rgba(24,119,242,0.3)"
      : "none",
  }),

  right: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  newUserLogout: {
  background: "#7f0000",
  color: "#fff",
  animation: "heartbeat 1s infinite",
  boxShadow: "0 0 15px rgba(127,0,0,0.8)",
},

  circleBtn: (dark) => ({
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: dark ? "#3a3b3c" : "#e4e6eb",
    cursor: "pointer",
    transition: "all 0.25s ease",
    color: dark ? "#fff" : "red",
  }),

  circleBtns: (dark) => ({
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: dark ? "#3a3b3c" : "#e4e6eb",
    cursor: "pointer",
    transition: "all 0.25s ease",
  }),


  tooltip: (dark) => ({
    position: "absolute",
    bottom: "-30px",
    left: "50%",
    transform: "translateX(-50%)",
    background: dark ? "#3a3b3c" : "#000",
    color: "#fff",
    padding: "5px 10px",
    borderRadius: "6px",
    fontSize: "12px",
    whiteSpace: "nowrap",
    pointerEvents: "none",
    opacity: 0.9,
  }),

  dropdown: (dark) => ({
    position: "absolute",
    top: "50px",
    left: "0",
    width: "300px",
    background: dark ? "#242526" : "#fff",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    padding: "8px 0",
    zIndex: 999,
  }),

  resultItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 12px",
    cursor: "pointer",
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },

  name: {
    fontWeight: "600",
    fontSize: "14px",
  },

  username: {
    fontSize: "12px",
    color: "gray",
  },

  profile: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    // background: "linear-gradient(135deg, #667eea, #764ba2)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
