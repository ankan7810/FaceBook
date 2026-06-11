import React, { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setUser } from "./redux/authSlice"

import Login from './Auth/Login'
import Signup from './Auth/Singup'
import ForgotPassword from './Auth/ForgotPassword'
import ResetPassword from './Auth/ResetPassword'
import VerifyOtp from './Auth/VerifyOtp'
import Home from './components/Home.jsx'
import UpdatePost from './pages/UpdatePost'
import DeletePost from './pages/DeletePost'
import UploadVideo from './components/UploadVideo'
import UpdateVideo from './pages/UpdateVideo'
import CreateStoryPage from './components/CreateStoryPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import ReelsPage from './pages/ReelsPage'
import { Toaster } from "react-hot-toast";
import SavedPage from './pages/SavedPage'
import UploadReel from './pages/UploadReel'
import Profile from './pages/Profile'
import FriendsPage from './pages/FriendsPage'
import FriendRequests from './pages/FriendRequests'
import Suggestions from './pages/Suggestions'
import AllFriends from './pages/AllFriends'
import LiveHome from './Livestream/LiveHome'
import GoLive from './Livestream/GoLive'
import LiveRoom from './Livestream/LiveRoom'
import ExclusiveContent from './pages/ExclusiveContent'
import Marketplace from './pages/Marketplace'
import MarketplaceProductDetails from './pages/MarketplaceProductDetails'
import CreateMarketplaceListing from './pages/CreateMarketplaceListing '
// import LiveStream from './Livestream/LiveStream.jsx'

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = true; // later connect with redux

  return isAuthenticated ? children : <Login />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute><Home /></ProtectedRoute>,
  },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/verify-otp", element: <VerifyOtp /> },
  { path: "/reset-password", element: <ResetPassword /> },

  {
    path: "/update-post/:postId",
    element: <ProtectedRoute><UpdatePost /></ProtectedRoute>,
  },
  {
    path: "/delete-post/:postId",
    element: <ProtectedRoute><DeletePost /></ProtectedRoute>,
  },
  {
    path: "/upload-video",
    element: <ProtectedRoute><UploadVideo /></ProtectedRoute>,
  },
  {
    path: "/update-video/:videoId",
    element: <ProtectedRoute><UpdateVideo /></ProtectedRoute>,
  },
  {
    path: "/create-story",
    element: <ProtectedRoute><CreateStoryPage /></ProtectedRoute>,
  },
  {
    path: "/privacy-policy",
    element: <ProtectedRoute><PrivacyPolicy /></ProtectedRoute>,
  },
  {
    path: "/reels",
    element: <ProtectedRoute><ReelsPage /></ProtectedRoute>,
  },
  {
    path: "/upload-reel",
    element: <ProtectedRoute><UploadReel /></ProtectedRoute>,
  },
  {
    path: "/saved",
    element: <ProtectedRoute><SavedPage /></ProtectedRoute>,
  },


  {
    path: "/live",
    element: <ProtectedRoute><LiveHome /></ProtectedRoute>,
  },
  {
    path: "/go-live",
    element: <ProtectedRoute><GoLive /></ProtectedRoute>,
  },
  {
    path: "/live/:id",
    element: <ProtectedRoute><LiveRoom /></ProtectedRoute>,
  },

  {
    path: "/exclusive/:userId",
    element: <ProtectedRoute><ExclusiveContent /></ProtectedRoute>,
  },

  {
    path: "/market",
    element: <ProtectedRoute><Marketplace /></ProtectedRoute>
  },

  {
    path: "/market/:id",
    element: <ProtectedRoute><MarketplaceProductDetails /></ProtectedRoute>
  },


  {
    path: "/market/create",
    element: <ProtectedRoute><CreateMarketplaceListing /></ProtectedRoute>
  },

  {
    path: "/profile/:userId",
    element: <ProtectedRoute><Profile /></ProtectedRoute>,
  },
  {
    path: "/friends",
    element: <ProtectedRoute><FriendsPage /></ProtectedRoute>,
    children: [
      {
        path: "requests",
        element: <ProtectedRoute><FriendRequests /></ProtectedRoute>,
      },
      {
        path: "suggestions",
        element: <ProtectedRoute><Suggestions /></ProtectedRoute>,
      },
      {
        path: "all",
        element: <ProtectedRoute><AllFriends /></ProtectedRoute>,
      },
    ],
  },

  {
    path: "*",
    element: (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>404 - Page Not Found</h2>
      </div>
    ),
  },
]);

const App = () => {
  const dispatch = useDispatch();

  // 🔥 THIS IS THE MISSING PIECE
  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) return;

    try {
      const parsed = JSON.parse(savedUser);

      if (parsed && parsed._id) {
        dispatch(setUser(parsed));
      } else {
        localStorage.removeItem("user");
      }
    } catch (e) {
      localStorage.removeItem("user", e);
    }
  }, [dispatch]);


  useEffect(() => {
    if (window.Razorpay) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      console.log("Razorpay SDK loaded ✅");
    };

    script.onerror = () => {
      console.error("Razorpay SDK failed ❌");
    };

    document.body.appendChild(script);
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: "#333",
            color: "#fff",
            borderRadius: "10px",
          },
        }}
      />
    </>
  );
};

export default App;