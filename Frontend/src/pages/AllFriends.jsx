import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1/";

const AllFriends = () => {
  const [friends, setFriends] = useState([]);

  const fetchFriends = async () => {
    const res = await axios.get(`${BASE_URL}/frRequest/friends`, { withCredentials: true });
    setFriends(res.data.friends);
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleUnfriend = async (id) => {
    await axios.put(`${BASE_URL}/frRequest/unfriend/${id}`, {}, { withCredentials: true });
    fetchFriends();
  };

  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      {friends.map((user) => (
        <div key={user._id} className="bg-white p-3 rounded shadow">
          <img
            src={user?.profileimage?.url || "/default.png"}
            className="h-40 w-full object-cover rounded"
          />
          <h3>{user.username}</h3>

          <button onClick={() => handleUnfriend(user._id)}>
            Unfriend
          </button>
        </div>
      ))}
    </div>
  );
};

export default AllFriends;