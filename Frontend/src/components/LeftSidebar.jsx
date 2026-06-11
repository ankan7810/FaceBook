import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useSelector } from "react-redux";

const menuItems = [
  { icon: "👤", label: "Profile", type: "profile" },
  { icon: "👥", label: "Friends", path: "/friends" },
  { icon: "🕒", label: "Memories" },
  { icon: "🔖", label: "Saved", path: "/saved" },
  { icon: "👨‍👩‍👧‍👦", label: "Groups" },
  { icon: "🎬", label: "Reels", path: "/reels" },
  { icon: "🛒", label: "Marketplace",path: "/market"},
  { icon: "📅", label: "Calendar", type: "calendar" },
  { icon: "📊", label: "Privacy Policy", path: "/privacy-policy" },
];

const LeftSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const reduxUser = useSelector((state) => state.auth.user);

  

  const [showCalendar, setShowCalendar] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showMore, setShowMore] = useState(false);

  const calendarRef = useRef(null);
  const triggerRef = useRef(null);

  const isDark = document.documentElement.classList.contains("dark");
  // eslint-disable-next-line no-unused-vars
  const getUser = () => {
    if (reduxUser?._id) return reduxUser;

    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser && savedUser !== "undefined") {
        return JSON.parse(savedUser);
      }
    } catch {
      return null;
    }

    return null;
  };

const user = useSelector((state) => state.auth.user);

const handleNavigation = (item) => {
  if (item.type === "calendar") {
    setShowCalendar(true);
    return;
  }

  if (item.type === "profile") {
    if (!user?._id) {
      console.error("User not initialized (check App.jsx)");
      return;
    }

    navigate(`/profile/${user._id}`);
    return;
  }

  if (item.path) {
    navigate(item.path);
  }
};

  // ✅ ACTIVE ROUTE
  const isActive = (item) => {
    if (item.type === "profile") {
      return location.pathname.startsWith("/profile");
    }
    return location.pathname === item.path;
  };

  // 🔹 Close calendar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target) &&
        !triggerRef.current.contains(e.target)
      ) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [showCalendar]);

  return (
    <div style={{ position: "relative" }}>
      <div style={styles.container}>
        {menuItems.map((item, index) => {
          const active = isActive(item);

          return (
            <div
              key={index}
              ref={item.type === "calendar" ? triggerRef : null}
              onClick={() => handleNavigation(item)}
              style={{
                ...styles.item,
                background: active
                  ? isDark
                    ? "#3a3b3c"
                    : "#e4e6eb"
                  : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = isDark
                    ? "#3a3b3c"
                    : "#e4e6eb";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span style={styles.icon}>{item.icon}</span>
              <span style={styles.label}>{item.label}</span>
            </div>
          );
        })}

        <div style={styles.seeMore} onClick={() => setShowMore(!showMore)}>
          {showMore ? "⬆️ See less" : "⬇️ See more"}
        </div>

        {showMore && (
          <div style={styles.footer}>
            Privacy · Terms · Ads · Cookies · Meta © 2026
          </div>
        )}
      </div>

      {/* CALENDAR */}
      {showCalendar && (
        <div style={styles.overlay} onClick={() => setShowCalendar(false)}>
          <div
            style={styles.calendarBox}
            ref={calendarRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.calendarHeader}>
              <span style={styles.calendarTitle}>📅 Events</span>
              <button
                style={styles.closeBtn}
                onClick={() => setShowCalendar(false)}
              >
                ✕
              </button>
            </div>

            <Calendar onChange={setDate} value={date} />

            <div style={styles.selectedDate}>
              {date.toDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeftSidebar;




const styles = {
  container: {
    width: "280px",
    position: "sticky",
    top: "70px",
    height: "calc(100vh - 70px)",
    overflowY: "auto",
    paddingRight: "10px",
  },
  item: {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px",
  borderRadius: "10px",
  transition: "0.2s ease",
  cursor: "pointer",
},
  icon: { fontSize: "20px" },
  label: { fontSize: "14px", fontWeight: "500" },
  seeMore: {
    marginTop: "10px",
    padding: "10px",
    cursor: "pointer",
    borderRadius: "8px",
    fontWeight: "500",
  },
  footer: {
    fontSize: "12px",
    color: "gray",
    marginTop: "15px",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  calendarBox: {
    width: "350px",
    background: "#242526",
    borderRadius: "16px",
    padding: "15px",
  },
  calendarHeader: {
    display: "flex",
    justifyContent: "space-between",
  },
  calendarTitle: { color: "#fff" },
  closeBtn: {
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
  },
  selectedDate: {
    marginTop: "10px",
    textAlign: "center",
    color: "#1877f2",
  },
};