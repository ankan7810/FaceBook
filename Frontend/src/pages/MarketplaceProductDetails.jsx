import { useEffect, useState } from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import axios from "axios";

import {
    ArrowLeft,
    MessageCircle,
    Share2,
    Bookmark,
} from "lucide-react";
import ShareModal from "@/components/ShareModal";
import { BASE_URL } from "@/Utils/Constant.js";
import toast from "react-hot-toast";

// const BASE_URL = "http://localhost:3000/api/v1";

const MarketplaceProductDetails = () => {
    const navigate = useNavigate();

    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [isPurchased, setIsPurchased] = useState(false);

    const fetchProduct = async () => {
        try {
            const res = await axios.get(
                `${BASE_URL}/market/${id}`,
                {
                    withCredentials: true,
                }
            );

            setProduct(res.data.product);

        } catch (error) {
            console.log(error);
        }
    };

    const handlePurchase = async () => {
        try {
            const options = {
                key: "rzp_test_RQWjBHRMtT37pD",
                amount: product.price * 100,
                currency: "INR",
                name: "Marketplace",
                description: product.productName,
                image: product.productImage.url,

                handler: function (response) {
                    console.log("Payment Success:", response);
                    setIsPurchased(true);
                    toast.success("Payment Successful!");
                },

                prefill: {
                    name: "Customer Name",
                    email: "customer@example.com",
                    contact: "9999999999",
                },

                theme: {
                    color: "#3399cc",
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchProduct();
    }, []);

    if (!product) {
        return (
            <div className="h-screen flex items-center justify-center dark:bg-[#18191a]">
                <h1 className="text-2xl dark:text-white">
                    Loading...
                </h1>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-black">

            {/* LEFT IMAGE */}
            <div className="flex-1 relative flex items-center justify-center">

                {/* BACK */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute
          top-5
          left-5
          z-50
          w-12
          h-12
          rounded-full
          bg-white/20
          backdrop-blur-md
          flex
          items-center
          justify-center
          text-white"
                >
                    <ArrowLeft className="text-white cursor-pointer" />
                </button>

                {/* IMAGE */}
                <img
                    src={product.productImage.url}
                    alt={product.productName}
                    className="max-h-screen
          object-contain"
                />
            </div>

            {/* RIGHT PANEL */}
            <div
                className="w-[430px]
        bg-white
        dark:bg-[#242526]
        overflow-y-auto"
            >

                <div className="p-6">

                    {/* TITLE */}
                    <h1 className="text-4xl font-bold dark:text-white">
                        {product.productName}
                    </h1>

                    {/* PRICE */}
                    <h2 className="text-3xl font-bold mt-4 dark:text-white">
                        ₹{product.price}
                    </h2>

                    {/* LOCATION */}
                    <p className="text-gray-500 mt-2">
                        {product.location}
                    </p>

                    {/* BUTTONS */}
                    <div className="flex gap-3 mt-6">

                        <button
                            disabled={isPurchased}
                            onClick={!isPurchased ? handlePurchase : undefined}
                            className={`flex-1
                            transition
                            text-white
                            py-3
                            rounded-xl
                            flex
                            items-center
                            cursor-pointer
                            justify-center
                            gap-2
                            font-semibold
                            ${isPurchased
                                    ? "bg-green-600 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                                }`}
                        >
                            <MessageCircle size={20} />
                            {isPurchased ? "Purchased" : "Purchase"}
                        </button>

                        <button
                            className="w-12
              h-12
              rounded-xl
              bg-[#f0f2f5]
              dark:bg-[#3a3b3c]
              flex
              items-center
              justify-center"
                        >
                            <Bookmark />
                        </button>

                        <button
                            onClick={() => setShowShareModal(true)}
                            className="w-12
                            h-12
                            rounded-xl
                            bg-[#f0f2f5]
                            dark:bg-[#3a3b3c]
                            flex
                            items-center
                            justify-center"
                        >
                            <Share2 className=" cursor-pointer" />
                        </button>

                    </div>

                    {/* DETAILS */}
                    <div className="mt-8">

                        <h2 className="text-2xl font-bold dark:text-white">
                            Details
                        </h2>

                        <div className="mt-4 space-y-3">

                            <DetailRow
                                label="Type"
                                value={product.type}
                            />

                            <DetailRow
                                label="Location"
                                value={product.location}
                            />

                            <DetailRow
                                label="Price"
                                value={`₹${product.price}`}
                            />

                        </div>

                    </div>

                    {/* DESCRIPTION */}
                    <div className="mt-8">

                        <h2 className="text-2xl font-bold dark:text-white">
                            Description
                        </h2>

                        <p className="mt-3 text-gray-600 dark:text-gray-300 leading-7">
                            {product.description}
                        </p>

                    </div>

                    {/* SELLER */}
                    <div className="mt-10 border-t pt-6">

                        <h2 className="text-2xl font-bold dark:text-white">
                            Seller Information
                        </h2>

                        <div className="flex items-center gap-4 mt-5">

                            <img
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/profile/${product?.seller?._id}`);
                                }}
                                src={
                                    product?.seller?.profileimage?.url ||
                                    "/default.png"
                                }
                                className="w-14 h-14 rounded-full cursor-pointer"
                            />

                            <div>
                                <h3 className="text-xl font-semibold dark:text-white">
                                    {product?.seller?.firstname}{" "}
                                    {product?.seller?.lastname}
                                </h3>

                                <p className="text-gray-500">
                                    Marketplace Seller
                                </p>
                            </div>

                        </div>

                    </div>

                </div>
            </div>
            {showShareModal && (
                <ShareModal
                    postId={product._id}
                    onClose={() => setShowShareModal(false)}
                />
            )}
        </div>
    );
};

const DetailRow = ({ label, value }) => {
    return (
        <div className="flex justify-between">

            <span className="text-gray-500">
                {label}
            </span>

            <span className="font-medium dark:text-white">
                {value}
            </span>

        </div>
    );
};

export default MarketplaceProductDetails;