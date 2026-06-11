import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1";
const USER_URL = `${BASE_URL}/user`;
const FR_URL = `${BASE_URL}/frRequest`;

const Suggestions = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await axios.get(`${FR_URL}/suggestions`, { withCredentials: true });
    setUsers(res.data.users);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSend = async (id) => {
    await axios.post(`${FR_URL}/send/${id}`, {}, { withCredentials: true });
    fetchUsers();
  };

  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      {users.map((user) => (
        <div key={user._id} className="bg-white p-3 rounded shadow">
          <img
            src={user?.profileimage?.url || "/default.png"}
            className="h-40 w-full object-cover rounded"
          />
          <h3>{user.username}</h3>

          <button onClick={() => handleSend(user._id)}>
            Add Friend
          </button>
        </div>
      ))}
    </div>
  );
};

export default Suggestions;