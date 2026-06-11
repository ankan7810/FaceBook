import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1";

const RightSidebar = () => {
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const isDark = document.documentElement.classList.contains("dark");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();


  // 🔹 Fetch Friend Requests
  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/frRequest/requests`, {
        withCredentials: true,
      });

      setFriendRequests((res.data.incoming || []).slice(0, 2));

    } catch (err) {
      console.error("Fetch Requests Error:", err);
    }
  };

  const isOnline = (lastActive) => {
    const now = Date.now();
    const last = new Date(lastActive).getTime();

    const diff = (now - last) / 1000;

    console.log("ONLINE CHECK:", diff);

    return diff < 60;
  };

  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/frRequest/friends`, {
        withCredentials: true,
      });

      setFriends((res.data.friends || []).slice(0, 10));
    } catch (err) {
      console.error("Fetch Friends Error:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchFriends();
  }, []);


  useEffect(() => {
    const timeout = setTimeout(() => {
      axios.post(`${BASE_URL}/user/active`, {}, {
        withCredentials: true,
      });
    }, 10000); // wait 10 sec before first ping

    const interval = setInterval(() => {
      axios.post(`${BASE_URL}/user/active`, {}, {
        withCredentials: true,
      });
    }, 30000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  // 🔹 Accept Request
  const handleAccept = async (requestId, senderUser) => {
    setLoading(true);

    // Optimistic UI
    const prevRequests = friendRequests;

    setFriendRequests((prev) =>
      prev.filter((req) => req._id !== requestId)
    );

    setFriends((prev) => [senderUser, ...prev].slice(0, 10));

    try {
      await axios.put(`${BASE_URL}/accept/${requestId}`, {}, {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Accept Error:", err.response?.data || err.message);

      // rollback
      setFriendRequests(prevRequests);
      setFriends((prev) =>
        prev.filter((u) => u._id !== senderUser._id)
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Reject Request
  const handleDelete = async (requestId) => {
    const prevRequests = friendRequests;

    setFriendRequests((prev) =>
      prev.filter((req) => req._id !== requestId)
    );

    try {
      await axios.put(`${BASE_URL}/reject/${requestId}`, {}, {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Delete Error:", err.response?.data || err.message);

      // rollback
      setFriendRequests(prevRequests);
    }
  };

  return (
    <div style={styles.container(isDark)}>

      {/* 🔹 Friend Requests */}
      {friendRequests.length > 0 && (
        <div style={styles.card}>
          <div style={styles.title}>Friend Requests</div>

          {friendRequests.map((req) => {
            const user = req.senderId;

            return (
              <div key={req._id} style={styles.fbCard}>

                <img
                  src={user?.profileimage?.url || "/default.png"}
                  style={styles.fbAvatar}
                />

                <div style={styles.fbContent}>
                  <div style={styles.fbName}>
                    {user?.username || "Unknown"}
                  </div>

                  <div style={styles.buttonGroup}>
                    <button
                      style={styles.confirmBtn}
                      disabled={loading}
                      onClick={() => handleAccept(req._id, user)}
                    >
                      Confirm
                    </button>

                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(req._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

              </div>
            );
          })}


        </div>
      )}

      {/* 🔹 Empty Requests */}
      {friendRequests.length === 0 && (
        <div style={styles.emptyText}>No new requests</div>
      )}

      {/* 🔹 Contacts */}
      <div>
        <div style={styles.contactsTitle}>Contacts</div>

        {friends.length === 0 && (
          <div style={styles.emptyText}>No contacts</div>
        )}

        {friends.map((user) => (
          <div key={user._id} style={styles.contactRow}>
            <div style={styles.avatarWrapper}>
              <img
                src={user?.profileimage?.url || "/default.png"}
                style={styles.avatar}
                onClick={() => navigate(`/profile/${user._id}`)}
              />
              {isOnline(user.lastActive) && (
                <div style={styles.onlineDot} />
              )}
            </div>

            <span style={styles.contactName(isDark)}>
              {user.username}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RightSidebar;


const styles = {
  container: (dark) => ({
    width: "300px",
    height: "calc(100vh - 70px)",
    overflowY: "auto",
    padding: "12px",
    backgroundColor: dark ? "#18191a" : "#f0f2f5",
  }),

  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "12px",
    marginBottom: "16px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
  },

  title: {
    fontWeight: "600",
    fontSize: "15px",
    marginBottom: "10px",
    color: "#1877f2",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  name: {
    fontSize: "14px",
    fontWeight: "500",
  },

  buttonGroup: {
    display: "flex",
    gap: "6px",
  },

  confirmBtn: {
    background: "#1877f2",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },

  deleteBtn: {
    background: "#e4e6eb",
    color: "#050505",
    border: "none",
    padding: "5px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
  },

  contactsTitle: {
    fontWeight: "600",
    fontSize: "14px",
    color: "gray",
    marginBottom: "10px",
  },

  contactRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  contactName: (dark) => ({
    fontSize: "14px",
    color: dark ? "#fff" : "#050505",
    fontWeight: "500",
  }),

  avatarWrapper: {
    position: "relative",
  },

  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    objectFit: "cover",
  },

  onlineDot: {
    width: "10px",
    height: "10px",
    background: "#31a24c",
    borderRadius: "50%",
    position: "absolute",
    bottom: 0,
    right: 0,
    border: "2px solid white",
  },

  emptyText: {
    fontSize: "13px",
    color: "gray",
    marginBottom: "10px",
  },
  fbCard: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "12px",
  },

  fbAvatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    objectFit: "cover",
  },

  fbContent: {
    flex: 1,
  },

  fbName: {
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "6px",
  },
};