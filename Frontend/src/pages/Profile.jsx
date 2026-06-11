import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
    Avatar,
    Box,
    Button,
    Typography,
    Card,
    CardContent,
} from "@mui/material";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Grid from "@mui/material/Grid";
import { FaRegEye } from "react-icons/fa6";
import { BASE_URL } from "@/Utils/Constant.js";

// const BASE_URL = "http://localhost:3000/api/v1";

const Profile = () => {
    const { userId } = useParams();

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [friends, setFriends] = useState([]);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [reels, setReels] = useState([]);
    const [activeTab, setActiveTab] = useState("Posts");
    const [activeReel, setActiveReel] = useState(null);
    const [activePostMenu, setActivePostMenu] = useState(null);
    const currentUser = useSelector((state) => state.auth.user);
    const isOwnProfile = String(currentUser?._id) === String(userId);
    const [openSubscribe, setOpenSubscribe] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("quarterly");

    const [formData, setFormData] = useState({
        liveIn: "",
        hometown: "",
        relationship: "",
        dateofBirth: "",
    });

    const profileInputRef = useRef();
    const coverInputRef = useRef();
    const videoRefs = useRef({});

    const checkSubscriptionStatus = async () => {
        try {
            const res = await axios.get(
                `${BASE_URL}/subscription/check/${userId}`,
                { withCredentials: true }
            );

            setIsSubscribed(res.data.isSubscribed);
        } catch (err) {
            console.log(err);
        }
    };

    const fetchFriends = async () => {
        try {
            const res = await axios.get(
                `${BASE_URL}/frRequest/friends`,
                { withCredentials: true }
            );
            setFriends(res.data.friends);
        } catch (err) {
            console.log(err);
        }
    };

    const fetchReels = async () => {
        try {
            const res = await axios.get(
                `${BASE_URL}/reels/user/${userId}`,
                { withCredentials: true }
            );
            setReels(res.data.reels);
        } catch (err) {
            console.log(err);
        }
    };

    const fetchProfile = async () => {
        const res = await axios.get(`${BASE_URL}/user/profile/${userId}`, { withCredentials: true });
        setUser({ ...res.data.user });

        setFormData({
            liveIn: res.data.user.liveIn || "",
            hometown: res.data.user.hometown || "",
            relationship: res.data.user.relationship || "",
            dateofBirth: res.data.user.dateofBirth || "",
        });
    };

    const handleUpdate = async () => {
        try {
            const res = await axios.put(
                `${BASE_URL}/user/update-intro`,
                formData,
                { withCredentials: true }
            );

            if (res.data.success) {
                toast.success("Profile updated ✅");
                setOpen(false);
                fetchProfile();
            }
        } catch {
            toast.error("Update failed ❌");
        }
    };
    const fetchPosts = async () => {
        const res = await axios.get(`${BASE_URL}/post/user/${userId}`, {
            withCredentials: true,
        });
        setPosts(res.data.posts);
    };

    useEffect(() => {
        if (userId) {
            fetchProfile();
            fetchPosts();
            checkSubscriptionStatus();
        }
    }, [userId]);


    useEffect(() => {
        if (activeTab === "Friends") {
            fetchFriends();
        }
    }, [activeTab]);


    useEffect(() => {
        if (!window.Razorpay) {
            toast.error("Payment service unavailable. Refresh page.");
        }
    }, []);

    const handleOpenSubscribe = () => {
        if (isOwnProfile) {
            toast.error("You cannot subscribe to yourself");
            return;
        }
        setOpenSubscribe(true);
    };

    const handleSubscribe = async () => {
        try {
            if (loadingPayment) return; // 🔥 prevent double click
            setLoadingPayment(true);

            if (!window.Razorpay) {
                toast.error("Payment SDK not loaded ❌");
                return;
            }

            const res = await axios.post(
                `${BASE_URL}/payment/create-order`,
                {
                    creatorId: userId,
                    plan: selectedPlan,
                },
                { withCredentials: true }
            );

            const { order } = res.data;

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY,
                amount: order.amount,
                currency: "INR",
                name: "Subscription",
                description: "Creator Subscription",
                order_id: order.id,

                handler: async function (response) {
                    try {
                        const verifyRes = await axios.post(
                            `${BASE_URL}/payment/verify`,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            },
                            { withCredentials: true }
                        );

                        if (verifyRes.data.success) {
                            toast.success("Subscription activated 🎉");
                            setIsSubscribed(true);
                            setOpenSubscribe(false);
                        }
                    } catch (err) {
                        toast.error("Verification failed ❌", err);
                    }
                },

                modal: {
                    ondismiss: async () => {
                        await axios.post(
                            `${BASE_URL}/payment/fail`,
                            { razorpay_order_id: order.id },
                            { withCredentials: true }
                        );
                    },
                },

                theme: {
                    color: "#1877f2",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            toast.error("Payment failed ❌", err);
        } finally {
            setLoadingPayment(false); // 🔥 reset
        }
    };

    const handleCancel = async () => {
        try {
            await axios.patch(
                `${BASE_URL}/subscription/cancel/${userId}`,
                {},
                { withCredentials: true }
            );

            toast.success("Subscription cancelled");
            setIsSubscribed(false);
            setOpenSubscribe(false);
        } catch {
            toast.error("Cancel failed");
        }
    };

    const handleProfileUpload = async (file) => {
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append("profileimage", file);

            const res = await axios.post(
                `${BASE_URL}/user/update/profilepic`,
                formData,
                { withCredentials: true }
            );

            if (res.data.success) {
                toast.success("Profile updated ✅");
                fetchProfile();
            }
        } catch (err) {
            toast.error("Upload failed ❌", err);
        }
    };

    const handleCoverUpload = async (file) => {
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append("coverimage", file);

            const res = await axios.post(
                `${BASE_URL}/user/update/coverpic`,
                formData,
                { withCredentials: true }
            );

            if (res.data.success) {
                toast.success("Cover updated ✅");
                fetchProfile();
            }
        } catch (err) {
            toast.error("Upload failed ❌", err);
        }
    };
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (!user || !user.firstname) {
        return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
    }



    return (
        <Box sx={{ background: "#f0f2f5", minHeight: "100vh" }}>

            {/* 🔥 COVER + HEADER */}
            <Box sx={{ background: "#fff", pb: 2 }}>
                <Box
                    sx={{
                        height: 320,
                        backgroundImage: `url(${user.coverimage || "https://images.unsplash.com/photo-1503264116251-35a269479413"})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderRadius: "0 0 12px 12px",
                        position: "relative",
                        cursor: isOwnProfile ? "pointer" : "default",
                        opacity: isOwnProfile ? 1 : 0.9,
                    }}
                    onClick={() => {
                        if (!isOwnProfile) return; // 🔥 BLOCK
                        coverInputRef.current.click();
                    }}
                >
                    {/* ✅ CLICKABLE */}
                    {!isOwnProfile && (
                        <>
                            {/* SUBSCRIBE BUTTON */}

                        </>
                    )}

                    {/* hidden input */}
                    <input
                        type="file"
                        hidden
                        ref={coverInputRef}
                        onChange={(e) => handleCoverUpload(e.target.files[0])}
                    />
                </Box>

                <Box sx={{ maxWidth: "1100px", margin: "auto", px: 2, mt: -8 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
                            <Box sx={{ position: "relative" }}>
                                <Avatar
                                    src={user.profileimage}
                                    sx={{
                                        width: 160,
                                        height: 160,
                                        border: "5px solid white",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                                        cursor: isOwnProfile ? "pointer" : "default",
                                        opacity: isOwnProfile ? 1 : 0.85,
                                    }}
                                    onClick={() => {
                                        if (!isOwnProfile) return; // 🔥 BLOCK
                                        profileInputRef.current.click();
                                    }}
                                />

                                {/* ✅ CLICKABLE CAMERA */}
                                {isOwnProfile && (
                                    <Box
                                        onClick={() => profileInputRef.current.click()}
                                        sx={{
                                            position: "absolute",
                                            bottom: 10,
                                            right: 10,
                                            width: 36,
                                            height: 36,
                                            borderRadius: "50%",
                                            background: "#e4e6eb",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                        }}
                                    >
                                        📷
                                    </Box>
                                )}

                                {/* hidden input */}
                                <input
                                    type="file"
                                    hidden
                                    ref={profileInputRef}
                                    onChange={(e) =>
                                        handleProfileUpload(e.target.files[0])
                                    }
                                />
                            </Box>

                            <Box>
                                <Typography variant="h4" fontWeight="bold">
                                    {user.firstname || ""} {user.lastname || ""}
                                </Typography>

                                <Typography color="text.secondary">
                                    {user.friendsCount} friends
                                </Typography>

                                <Typography sx={{ mt: 1, fontSize: "14px", color: "#555" }}>
                                    📍 {user.liveIn || "Kolkata"} • 🎓{" "}
                                    {user.education || "RCC Institute"}
                                </Typography>

                            </Box>
                        </Box>

                        <Box sx={{ display: "flex", gap: 1, mt: { xs: 2, md: 0 } }}>
                            {isOwnProfile && (
                                <Button
                                    variant="contained"
                                    disabled={!isOwnProfile}
                                    sx={{
                                        textTransform: "none",
                                        opacity: isOwnProfile ? 1 : 0.5,
                                        cursor: isOwnProfile ? "pointer" : "not-allowed",
                                    }}
                                    onClick={() => {
                                        if (!isOwnProfile) return;
                                        navigate("/create-story");
                                    }}
                                >
                                    + Add to story
                                </Button>
                            )}
                            {isOwnProfile && (
                                <Button
                                    variant="outlined"
                                    sx={{ textTransform: "none" }}
                                    onClick={() => setOpen(true)}
                                >
                                    Edit profile
                                </Button>
                            )}

                            {!isOwnProfile && (
                                <>
                                    {/* SUBSCRIBE BUTTON */}
                                    <Button
                                        variant="contained"
                                        sx={{
                                            textTransform: "none",
                                            background: isSubscribed ? "#42b72a" : "#1877f2",
                                            borderRadius: "10px",
                                            px: 2.5,
                                        }}
                                        onClick={handleOpenSubscribe}
                                    >
                                        {isSubscribed ? "Subscribed" : "Subscribe"}
                                    </Button>

                                    {/* ACCESS BUTTON */}
                                    {isSubscribed && (
                                        <Button
                                            variant="outlined"
                                            onClick={() => navigate(`/exclusive/${userId}`)}
                                            sx={{
                                                textTransform: "none",
                                                borderRadius: "10px",
                                                px: 2.5,
                                                borderColor: "#1877f2",
                                                color: "#1877f2",

                                                "&:hover": {
                                                    borderColor: "#166fe5",
                                                    background: "#f0f7ff",
                                                },
                                            }}
                                        >
                                            🔥 Exclusive Content
                                        </Button>
                                    )}
                                </>
                            )}
                        </Box>
                    </Box>

                    {/* TABS */}
                    <Box
                        sx={{
                            mt: 3,
                            borderTop: "1px solid #ddd",
                            pt: 1,
                            display: "flex",
                            gap: 3,
                        }}
                    >
                        {["Posts", "Friends", "Photos", "Reels"].map((tab) => (
                            <Typography
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);

                                    if (tab === "Reels") {
                                        fetchReels();
                                    }
                                }}
                                sx={{
                                    cursor: "pointer",
                                    fontWeight: tab === activeTab ? "bold" : "500",
                                    color: tab === activeTab ? "#1877f2" : "#65676b",
                                }}
                            >
                                {tab}
                            </Typography>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* 🔥 MAIN CONTENT (UNCHANGED) */}
            <Grid
                container
                spacing={2}
                alignItems="flex-start"
                sx={{
                    maxWidth: "1400px",
                    margin: "auto",
                    mt: 2,
                    px: 2,
                }}
            >
                {/* LEFT */}
                <Grid item xs={12} md={3}>
                    <Card sx={{ borderRadius: 3, mb: 2, width: "100%" }}>
                        <CardContent>
                            <Typography variant="h6">Personal details</Typography>
                            <Typography>📍 Lives in {user.liveIn}</Typography>
                            <Typography>🏠 From {user.hometown}</Typography>
                            <Typography>❤️ {user.relationship}</Typography>
                            <Typography>❤️ {user.dateofBirth}</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* RIGHT */}
                <Grid item xs={12} md={7}>

                    {activeTab === "Posts" &&
                        posts.map((post) => {
                            const isPostOwner =
                                String(post.user?._id || post.user) === String(currentUser?._id);

                            return (
                                <Card
                                    key={post._id}
                                    sx={{
                                        mb: 2,
                                        maxWidth: "500px",
                                        width: "100%",
                                        mx: "auto",
                                        borderRadius: 3,
                                        overflow: "visible",
                                    }}
                                >
                                    {/* <CardContent sx={{ p: 0, position: "relative" }}> */}
                                    <CardContent
                                        sx={{
                                            p: 0,
                                            position: "relative",
                                            overflow: "visible",
                                        }}
                                    >

                                        {/* 🔥 POST MENU (TOP RIGHT) */}
                                        {/* 🔥 POST MENU (TOP RIGHT) */}
                                        {isPostOwner && (
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    top: 10,
                                                    right: 10,
                                                    zIndex: 50,
                                                }}
                                            >
                                                {/* THREE DOT BUTTON */}
                                                <Box
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActivePostMenu(
                                                            activePostMenu === post._id ? null : post._id
                                                        );
                                                    }}
                                                    sx={{
                                                        width: 34,
                                                        height: 34,
                                                        borderRadius: "50%",
                                                        background: "rgba(255,255,255,0.9)",
                                                        backdropFilter: "blur(10px)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        cursor: "pointer",
                                                        zIndex: 9999,
                                                    }}
                                                >
                                                    ⋯
                                                </Box>

                                                {/* 🔥 FACEBOOK STYLE DROPDOWN */}
                                                {activePostMenu === post._id && (
                                                    <Box
                                                        sx={{
                                                            position: "absolute",
                                                            top: 0,
                                                            right: "45px",

                                                            background: "rgba(255,255,255,0.85)",
                                                            backdropFilter: "blur(14px)",

                                                            borderRadius: "16px",
                                                            overflow: "hidden",

                                                            minWidth: "160px",

                                                            boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                                                            border: "1px solid rgba(255,255,255,0.3)",

                                                            display: "flex",
                                                            flexDirection: "column",

                                                            animation: "fadeMenu 0.22s ease",

                                                            zIndex: 100,
                                                        }}
                                                    >
                                                        {/* UPDATE */}
                                                        <Box
                                                            onClick={() =>
                                                                navigate(`/update-post/${post._id}`)
                                                            }
                                                            sx={{
                                                                px: 2,
                                                                py: 1.5,
                                                                cursor: "pointer",
                                                                fontSize: "14px",
                                                                fontWeight: 500,

                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 1,

                                                                transition: "0.2s",

                                                                "&:hover": {
                                                                    background: "#f0f2f5",
                                                                },
                                                            }}
                                                        >
                                                            ✏️ Update
                                                        </Box>

                                                        {/* DELETE */}
                                                        <Box
                                                            onClick={() =>
                                                                navigate(`/delete-post/${post._id}`)
                                                            }
                                                            sx={{
                                                                px: 2,
                                                                py: 1.5,
                                                                cursor: "pointer",
                                                                fontSize: "14px",
                                                                fontWeight: 500,
                                                                color: "#e53935",

                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 1,

                                                                transition: "0.2s",

                                                                "&:hover": {
                                                                    background: "#fff0f0",
                                                                },
                                                            }}
                                                        >
                                                            🗑 Delete
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>
                                        )}

                                        {/* CAPTION */}
                                        <Box
                                            sx={{
                                                px: 3,
                                                py: post.media?.length ? 2 : 4,
                                                minHeight: post.media?.length ? "auto" : "8px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                textAlign: "center",
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: post.media?.length ? "15px" : "20px",
                                                    fontWeight: post.media?.length ? 300 : 400,
                                                    wordBreak: "break-word",
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                {post.caption}
                                            </Typography>
                                        </Box>

                                        {/* IMAGE */}
                                        {post.media?.[0] && (
                                            <Box sx={{ mt: 1 }}>
                                                <img
                                                    src={post.media[0]}
                                                    style={{
                                                        width: "100%",
                                                        maxHeight: "400px",
                                                        objectFit: "contain",
                                                        background: "#000",
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}

                    {activeTab === "Reels" && (
                        <>
                            {reels.length === 0 ? (
                                <Typography sx={{ textAlign: "center", mt: 5 }}>
                                    You haven't created any reels yet.
                                </Typography>
                            ) : (
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: {
                                            xs: "1fr",
                                            md: "repeat(2, 1fr)",
                                            xl: "repeat(3, 1fr)",
                                        },
                                        gap: 2,
                                    }}
                                >
                                    {reels.map((reel) => (
                                        <Box
                                            key={reel._id}
                                            sx={{ position: "relative", cursor: "pointer" }}
                                            onClick={() => {
                                                const video = videoRefs.current[reel._id];

                                                // IF SAME VIDEO IS OPEN
                                                if (activeReel === reel._id) {
                                                    if (video.paused) {
                                                        video.play();
                                                    } else {
                                                        video.pause();
                                                    }
                                                } else {
                                                    setActiveReel(reel._id);

                                                    setTimeout(() => {
                                                        const newVideo = videoRefs.current[reel._id];

                                                        if (newVideo) {
                                                            newVideo.play();
                                                        }
                                                    }, 100);
                                                }
                                            }}
                                        >

                                            {/* 🔥 THUMBNAIL */}
                                            {activeReel === reel._id ? (
                                                <video
                                                    ref={(el) => (videoRefs.current[reel._id] = el)}
                                                    src={reel.video}
                                                    controls
                                                    playsInline
                                                    style={{
                                                        width: "100%",
                                                        height: "250px",
                                                        borderRadius: "10px",
                                                        objectFit: "cover",
                                                        background: "#000",
                                                    }}
                                                />
                                            ) : (
                                                <img
                                                    src={reel.thumbnail || reel.video}
                                                    style={{
                                                        width: "100%",
                                                        height: "250px",
                                                        objectFit: "cover",
                                                        borderRadius: "10px",
                                                        cursor: "pointer",
                                                    }}
                                                />
                                            )}
                                            {/* 👁 TOTAL VIEWS */}
                                            {activeReel !== reel._id && (
                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        bottom: 10,
                                                        left: 10,
                                                        background: "rgba(0,0,0,0.65)",
                                                        color: "#fff",
                                                        padding: "4px 8px",
                                                        borderRadius: "20px",
                                                        fontSize: "12px",
                                                        fontWeight: 600,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "4px",
                                                        backdropFilter: "blur(4px)",
                                                    }}
                                                >
                                                    <FaRegEye />{reel.views || 0}
                                                </Box>
                                            )}

                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </>
                    )}


                    {activeTab === "Friends" && (
                        <Box
                            sx={{
                                width: "100%",
                                background: "#fff",
                                borderRadius: "16px",
                                p: 3,
                                boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                            }}
                        >
                            {/* HEADER */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 3,
                                    flexWrap: "wrap",
                                    gap: 2,
                                }}
                            >
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: "32px",
                                            fontWeight: "bold",
                                            lineHeight: 1,
                                        }}
                                    >
                                        Friends
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: "15px",
                                            color: "#65676b",
                                            mt: 0.5,
                                        }}
                                    >
                                        {friends.length} friends
                                    </Typography>
                                </Box>

                                {/* SEARCH */}
                                <Box
                                    sx={{
                                        background: "#f0f2f5",
                                        borderRadius: "30px",
                                        px: 2,
                                        py: 1,
                                        width: "240px",
                                    }}
                                >
                                    <input
                                        placeholder="Search friends"
                                        style={{
                                            border: "none",
                                            outline: "none",
                                            background: "transparent",
                                            width: "100%",
                                            fontSize: "14px",
                                        }}
                                    />
                                </Box>
                            </Box>

                            {/* FRIENDS GRID */}
                            {friends.length === 0 ? (
                                <Typography
                                    sx={{
                                        textAlign: "center",
                                        py: 5,
                                        color: "#65676b",
                                    }}
                                >
                                    No friends found
                                </Typography>
                            ) : (
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: {
                                            xs: "1fr",
                                            sm: "repeat(2, 1fr)",
                                            md: "repeat(2, 1fr)",
                                            xl: "repeat(3, 1fr)",
                                        },
                                        gap: 2,
                                    }}
                                >

                                    {friends.map((friend) => {
                                        // HANDLE DIFFERENT API STRUCTURES
                                        const friendUser =
                                            friend.sender?._id === currentUser?._id
                                                ? friend.receiver
                                                : friend.sender || friend;

                                        return (
                                            <Box
                                                key={friendUser._id}
                                                sx={{
                                                    border: "1px solid #e4e6eb",
                                                    borderRadius: "14px",
                                                    overflow: "hidden",
                                                    background: "#fff",

                                                    transition: "0.2s",

                                                    "&:hover": {
                                                        transform: "translateY(-2px)",
                                                        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                                                    },
                                                }}
                                            >
                                                {/* IMAGE */}
                                                <Box
                                                    onClick={() =>
                                                        navigate(`/profile/${friendUser._id}`)
                                                    }
                                                    sx={{
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <img
                                                        src={
                                                            friendUser.profileimage ||
                                                            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                                                        }
                                                        alt="friend"
                                                        style={{
                                                            width: "100%",
                                                            height: "220px",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                </Box>

                                                {/* CONTENT */}
                                                <Box sx={{ p: 2 }}>
                                                    {/* NAME */}
                                                    <Typography
                                                        onClick={() =>
                                                            navigate(`/profile/${friendUser._id}`)
                                                        }
                                                        sx={{
                                                            fontSize: "18px",
                                                            fontWeight: "bold",
                                                            cursor: "pointer",

                                                            "&:hover": {
                                                                textDecoration: "underline",
                                                            },
                                                        }}
                                                    >
                                                        {friendUser.firstname} {friendUser.lastname}
                                                    </Typography>

                                                    {/* USERNAME */}
                                                    <Typography
                                                        sx={{
                                                            color: "#65676b",
                                                            fontSize: "14px",
                                                            mt: 0.5,
                                                        }}
                                                    >
                                                        @{friendUser.username}
                                                    </Typography>

                                                    {/* MUTUAL */}
                                                    <Typography
                                                        sx={{
                                                            color: "#65676b",
                                                            fontSize: "13px",
                                                            mt: 1,
                                                        }}
                                                    >
                                                    </Typography>


                                                </Box>
                                            </Box>
                                        );
                                    })}

                                </Box>
                            )}
                        </Box>
                    )}


                </Grid>
            </Grid>
            {/* ✅ ADD THIS HERE (NOT inside Grid, NOT inside Card) */}
            {open && (
                <Box
                    onClick={() => setOpen(false)}
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.6)", // slightly deeper blur
                        backdropFilter: "blur(4px)",   // 🔥 glass effect
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2000,
                    }}
                >
                    <Box
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                            background: "#fff",
                            padding: 4,
                            borderRadius: 4,
                            width: "380px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                            animation: "fadeIn 0.25s ease",
                        }}
                    >
                        {/* HEADER */}
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, textAlign: "center" }}
                        >
                            Edit Profile
                        </Typography>

                        {/* INPUTS */}
                        <input
                            name="liveIn"
                            value={formData.liveIn}
                            onChange={handleChange}
                            placeholder="📍 Live In"
                            style={inputStyle}
                        />

                        <input
                            name="hometown"
                            value={formData.hometown}
                            onChange={handleChange}
                            placeholder="🏠 Hometown"
                            style={inputStyle}
                        />

                        <input
                            name="relationship"
                            value={formData.relationship}
                            onChange={handleChange}
                            placeholder="❤️ Relationship"
                            style={inputStyle}
                        />

                        <input
                            type="date"
                            name="dateofBirth"
                            value={formData.dateofBirth}
                            onChange={handleChange}
                            style={inputStyle}
                        />

                        {/* BUTTONS */}
                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => setOpen(false)}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleUpdate}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                    fontWeight: 600,
                                }}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </Box>

                    {/* ANIMATION */}
                    <style>
                        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}
                    </style>
                </Box>
            )}


            {openSubscribe && (
                <Box
                    onClick={() => setOpenSubscribe(false)}
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2000,
                    }}
                >
                    <Box
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                            background: "#fff",
                            padding: 3,
                            borderRadius: 3,
                            width: "400px",
                        }}
                    >
                        {/* TITLE */}
                        <Typography variant="h6" fontWeight="bold">
                            Subscribe to {user.firstname}
                        </Typography>

                        {/* DESCRIPTION */}
                        <Typography sx={{ mt: 2 }}>
                            Get exclusive content, badges and more 🔥
                        </Typography>

                        {/* 🔥 PLAN SELECTION */}
                        <Box
                            sx={{
                                mt: 2,
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                            }}
                        >
                            {/* 3 MONTH PLAN */}
                            <Box
                                onClick={() => setSelectedPlan("quarterly")}
                                sx={{
                                    border:
                                        selectedPlan === "quarterly"
                                            ? "2px solid #1877f2"
                                            : "1px solid #ddd",
                                    borderRadius: "10px",
                                    padding: 2,
                                    cursor: "pointer",
                                }}
                            >
                                <Typography fontWeight="bold">₹399</Typography>
                                <Typography fontSize="13px">3 Months</Typography>
                            </Box>

                            {/* 12 MONTH PLAN */}
                            <Box
                                onClick={() => setSelectedPlan("yearly")}
                                sx={{
                                    border:
                                        selectedPlan === "yearly"
                                            ? "2px solid #1877f2"
                                            : "1px solid #ddd",
                                    borderRadius: "10px",
                                    padding: 2,
                                    cursor: "pointer",
                                }}
                            >
                                <Typography fontWeight="bold">₹599</Typography>
                                <Typography fontSize="13px">12 Months</Typography>
                            </Box>
                        </Box>

                        {/* SUBSCRIBE BUTTON */}
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3 }}
                            onClick={handleSubscribe}
                            disabled={loadingPayment}
                        >
                            {loadingPayment ? "Processing..." : "Subscribe"}
                        </Button>

                        {/* CANCEL BUTTON */}
                        {isSubscribed && (
                            <Button
                                fullWidth
                                variant="outlined"
                                sx={{ mt: 2 }}
                                onClick={handleCancel}
                            >
                                Cancel Subscription
                            </Button>
                        )}
                    </Box>
                </Box>
            )}

        </Box>

    );
};

export default Profile;


const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none",
    fontSize: "14px",
    transition: "0.2s",
};