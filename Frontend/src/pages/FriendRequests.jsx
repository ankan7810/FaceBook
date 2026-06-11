import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1/";

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);

  // 🔥 FIXED: Only incoming
  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/frRequest/requests`, {
        withCredentials: true,
      });

      console.log("REQUEST API:", res.data);

      // ✅ ONLY incoming requests
      setRequests(res.data.incoming || []);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    await axios.put(`${BASE_URL}/frRequest/accept/${id}`, {}, {
      withCredentials: true,
    });
    fetchRequests();
  };

  const handleReject = async (id) => {
    await axios.put(`${BASE_URL}/frRequest/reject/${id}`, {}, {
      withCredentials: true,
    });
    fetchRequests();
  };

  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">

      {requests.length === 0 && (
        <p className="text-gray-500">No incoming requests</p>
      )}

      {requests.map((req) => {
        const user = req.senderId || {};

        return (
          <div key={req._id} className="bg-white p-3 rounded shadow">

            <img
              src={user?.profileimage?.url || "/default.png"}
              className="h-40 w-full object-cover rounded"
            />

            <h3 className="mt-2 font-semibold">
              {user?.username || "Unknown"}
            </h3>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleAccept(req._id)}
                className="flex-1 bg-blue-600 text-white py-1 rounded"
              >
                Confirm
              </button>

              <button
                onClick={() => handleReject(req._id)}
                className="flex-1 bg-gray-300 py-1 rounded"
              >
                Delete
              </button>
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default FriendRequests;