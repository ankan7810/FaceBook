import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1/";
const USER_URL = "http://localhost:3000/api/v1/user";

const FriendsPage = () => {
    const [activeTab, setActiveTab] = useState("requests");

    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [friends, setFriends] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        if (activeTab === "requests") fetchRequests();
        if (activeTab === "friends") fetchFriends();
        if (activeTab === "suggestions") fetchSuggestions();
    }, [activeTab]);

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/frRequest/requests`, {
                withCredentials: true,
            });
            console.log("API DATA:", res.data);

            const currentUser = JSON.parse(localStorage.getItem("user"));

            // ✅ FIXED incoming
            const incomingOnly = (res.data.incoming || []).filter((req) => {
                const receiverId = req.receiverId?._id || req.receiverId;
                return String(receiverId) === String(currentUser._id);
            });

            // ✅ FIXED outgoing
            const outgoingOnly = (res.data.outgoing || []).filter((req) => {
                const senderId = req.senderId?._id || req.senderId;
                return String(senderId) === String(currentUser._id);
            });

            setIncoming(incomingOnly);   // ✅ correct
            setOutgoing(outgoingOnly);   // ✅ correct

        } catch (err) {
            console.error(err);
        }
    };

    const fetchFriends = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/frRequest/friends`, {
                withCredentials: true,
            });
            setFriends(res.data.friends);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSuggestions = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/frRequest/suggestions`, {
                withCredentials: true,
            });

            setSuggestions(res.data.suggestions);

        } catch (err) {
            console.error(err);
        }
    };


    const handleAccept = async (id) => {
        if (!id) {
            console.error("Invalid request ID");
            return;
        }

        console.log("Accepting requestId:", id);

        try {
            await axios.put(`${BASE_URL}/frRequest/accept/${id}`, {}, {
                withCredentials: true,
            });

            fetchRequests();
            fetchFriends();
        } catch (err) {
            console.error(err.response?.data || err.message);
        }
    };

    // ❌ Reject
    const handleReject = async (id) => {
        await axios.put(`${BASE_URL}/frRequest/reject/${id}`, {}, { withCredentials: true });
        fetchRequests();
    };

    // ❌ Cancel (NEW)
    const handleCancel = async (id) => {
        await axios.delete(`${BASE_URL}/frRequest/cancel/${id}`, {
            withCredentials: true,
        });
        fetchRequests();
    };

    // ➕ Send Request
    const handleSend = async (id) => {
        await axios.post(`${BASE_URL}/frRequest/send/${id}`, {}, { withCredentials: true });
        fetchSuggestions();
    };

    // 🚫 Unfriend
    const handleUnfriend = async (id) => {
        await axios.put(`${BASE_URL}/frRequest/unfriend/${id}`, {}, {
            withCredentials: true,
        });
        fetchFriends();
    };

    return (
        <div className="flex min-h-screen bg-gray-100">

            {/* Sidebar */}
            <div className="w-64 bg-white p-4 shadow-md">
                <h2 className="text-xl font-bold mb-4">Friends</h2>

                <div className="space-y-3">
                    <p
                        onClick={() => setActiveTab("requests")}
                        className={`cursor-pointer ${activeTab === "requests"
                            ? "font-semibold text-blue-600"
                            : "text-gray-600"
                            }`}
                    >
                        Friend Requests
                    </p>

                    <p
                        onClick={() => setActiveTab("suggestions")}
                        className={`cursor-pointer ${activeTab === "suggestions"
                            ? "font-semibold text-blue-600"
                            : "text-gray-600"
                            }`}
                    >
                        Suggestions
                    </p>

                    <p
                        onClick={() => setActiveTab("friends")}
                        className={`cursor-pointer ${activeTab === "friends"
                            ? "font-semibold text-blue-600"
                            : "text-gray-600"
                            }`}
                    >
                        All Friends
                    </p>
                </div>
            </div>

            {/* Main */}
            <div className="flex-1 p-6">

                {/* 🔵 FRIEND REQUESTS */}
                {activeTab === "requests" && (
                    <>
                        <h2 className="text-2xl font-semibold mb-4">
                            Friend Requests
                        </h2>

                        {/* Incoming */}
                        <h3 className="text-lg font-semibold mb-2">Incoming</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {incoming.map((req) => {
                                const user = req.senderId;

                                return (
                                    <div key={req._id} className="bg-white rounded-xl shadow p-3">

                                        <img
                                            src={user?.profileimage?.url || "/default.png"}
                                            className="w-full h-40 object-cover rounded-lg"
                                        />

                                        <h3 className="mt-2 font-semibold">
                                            {user?.username}
                                        </h3>

                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => handleAccept(req._id)}
                                                className="flex-1 bg-blue-600 text-white py-1 rounded-lg"
                                            >
                                                Confirm
                                            </button>

                                            <button
                                                onClick={() => handleReject(req._id)}
                                                className="flex-1 bg-gray-300 py-1 rounded-lg"
                                            >
                                                Delete
                                            </button>
                                        </div>

                                    </div>
                                );
                            })}
                        </div>

                        {/* Outgoing */}
                        <h3 className="text-lg font-semibold mt-8 mb-2">Sent Requests</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {outgoing.map((req) => {
                                const user = req.receiverId;

                                return (
                                    <div key={req._id} className="bg-white rounded-xl shadow p-3">

                                        <img
                                            src={user?.profileimage?.url || "/default.png"}
                                            className="w-full h-40 object-cover rounded-lg"
                                        />

                                        <h3 className="mt-2 font-semibold">
                                            {user?.username}
                                        </h3>

                                        <button
                                            onClick={() => handleCancel(req._id)}
                                            className="w-full mt-3 bg-gray-600 text-white py-1 rounded-lg hover:bg-gray-700 cursor-pointer"
                                        >
                                            Cancel Request
                                        </button>

                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* 🟡 SUGGESTIONS */}
                {activeTab === "suggestions" && (
                    <>
                        <h2 className="text-2xl font-semibold mb-4">
                            Suggestions
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {suggestions.map((user) => (
                                <div key={user._id} className="bg-white rounded-xl shadow p-3">
                                    <img
                                        src={user?.profileimage?.url || "/default.png"}
                                        className="w-full h-40 object-cover rounded-lg"
                                    />
                                    <h3 className="mt-2 font-semibold">
                                        {user.username}
                                    </h3>

                                    <button
                                        onClick={() => handleSend(user._id)}
                                        className="w-full mt-3 bg-blue-500 text-white py-1 rounded-lg"
                                    >
                                        Add Friend
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* 🟢 ALL FRIENDS */}
                {activeTab === "friends" && (
                    <>
                        <h2 className="text-2xl font-semibold mb-4">
                            All Friends
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {friends.map((friend) => (
                                <div key={friend._id} className="bg-white rounded-xl shadow p-3">
                                    <img
                                        src={friend?.profileimage?.url || "/default.png"}
                                        className="w-full h-40 object-cover rounded-lg"
                                    />
                                    <h3 className="mt-2 font-semibold">
                                        {friend.username}
                                    </h3>

                                    <button
                                        onClick={() => handleUnfriend(friend._id)}
                                        className="w-full mt-3 bg-red-500 text-white py-1 rounded-lg"
                                    >
                                        Unfriend
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default FriendsPage;
