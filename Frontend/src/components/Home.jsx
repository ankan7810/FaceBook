import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import Navbar from "./Navbar";
import Stories from "./Stories";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard ";
import VideoCard from "./VideoCard";

import { fetchFeed } from "@/redux/feedSlice";

const Home = () => {
  const dispatch = useDispatch();
  const { feed } = useSelector((state) => state.feed);

  const [loading, setLoading] = useState(false);

  // ✅ DARK MODE STATE (reactive + clean)
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

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

  // 🔥 LOAD FEED
  const loadFeed = async () => {
    setLoading(true);
    await dispatch(fetchFeed());

    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  // 🔥 INITIAL + INTERVAL
  useEffect(() => {
    loadFeed();

    const interval = setInterval(() => {
      loadFeed();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        background: isDark ? "#18191a" : "#f0f2f5",
        minHeight: "100vh",
        color: isDark ? "#e4e6eb" : "#000",
        transition: "all 0.3s ease",
      }}
    >
      <Navbar />

      {/* LEFT SIDEBAR */}
      <div
        style={{
          position: "fixed",
          top: "70px",
          left: 0,
          width: "260px",
          background: isDark ? "#18191a" : "#fff",
          height: "100%",
        }}
      >
        <LeftSidebar />
      </div>

      {/* RIGHT SIDEBAR */}
      <div
        style={{
          position: "fixed",
          top: "70px",
          right: 0,
          width: "22vw",
          minWidth: "300px",
          maxWidth: "380px",
          background: isDark ? "#18191a" : "#fff",
          height: "100%",
        }}
      >
        <RightSidebar />
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          marginLeft: "280px",
          marginRight: "360px",
          padding: "20px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "580px" }}>
          <Stories />
          <CreatePost />

          {/* 🔥 LOADER */}
          {loading && (
            <div style={styles.loader}>
              <div
                style={{
                  ...styles.spinner,
                  border: isDark ? "4px solid #444" : "4px solid #ddd",
                }}
              ></div>
            </div>
          )}

          {/* 🔥 FEED */}
          {feed?.map((item) => {
            if (item?.type === "post") {
              return <PostCard key={item.id} post={item} />;
            }

            if (item?.type === "video") {
              return <VideoCard key={item.id} video={item} />;
            }

            if (item?._id) {
              return <PostCard key={item._id} post={item} />;
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;

// 🔧 STYLES
const styles = {
  loader: {
    display: "flex",
    justifyContent: "center",
    margin: "15px 0",
  },

  spinner: {
    width: "30px",
    height: "30px",
    borderTop: "4px solid #1877f2",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};