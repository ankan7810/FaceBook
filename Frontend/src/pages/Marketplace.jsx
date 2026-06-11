import { useEffect, useState } from "react";
import axios from "axios";
import {
    Store,
    Bell,
    ShoppingBag,
    Tags,
    Plus,
    Search,
    ArrowLeft
} from "lucide-react";
import { FaRegTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "@/Utils/Constant.js";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";


// const BASE_URL = "http://localhost:3000/api/v1";

const Marketplace = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");

    const fetchProducts = async () => {
        try {
            const res = await axios.get(
                `${BASE_URL}/market/all`,
                {
                    withCredentials: true,
                }
            );

            setProducts(res.data.products);

        } catch (error) {
            console.log(error);
        }
    };

    const searchProducts = async (searchText = "") => {
        try {
            const res = await axios.get(
                `${BASE_URL}/market/search?query=${searchText}`,
                {
                    withCredentials: true,
                }
            );

            setProducts(res.data.products);

        } catch (error) {
            console.log(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(
                `${BASE_URL}/market/delete/${id}`,
                {
                    withCredentials: true,
                }
            );
            console.log(res.data);

            // SUCCESS TOAST
            toast.success("Product deleted successfully");

            setProducts((prev) =>
                prev.filter((item) => item._id !== id)
            );

        } catch (error) {

            // UNAUTHORIZED TOAST
            if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error("You are not authorized to delete this product");
            } else {
                toast.error("Failed to delete product");
            }

            // console.log(error);
        }
    };

    useEffect(() => {
        if (search.trim() === "") {
            fetchProducts();
        } else {
            searchProducts(search);
        }
    }, [search]);

    return (
        <div className="flex bg-[#f0f2f5] dark:bg-[#18191a] min-h-screen">
             <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                }}
            />

            {/* SIDEBAR */}
             <div
                className="w-[360px]
                fixed
                top-0
                left-0
                h-screen
                bg-white
                dark:bg-[#242526]
                border-r
                border-gray-200
                dark:border-gray-700
                p-5
                overflow-y-auto"
            >

                {/* TITLE */}
                <div className="flex items-center gap-4">

                    <button
                        onClick={() => navigate("/")}
                        className="w-10
                        h-10
                        rounded-full
                        bg-[#f0f2f5]
                        dark:bg-[#3a3b3c]
                        flex
                        items-center
                        justify-center
                        cursor-pointer"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <h1 className="text-4xl font-bold dark:text-white">
                        Marketplace
                    </h1>

                </div>
                {/* SEARCH */}
                <div
                    className="mt-5
          flex
          items-center
          gap-3
          bg-[#f0f2f5]
          dark:bg-[#3a3b3c]
          px-4
          py-3
          rounded-full"
                >
                    <Search size={20} />



                    <input
                        type="text"
                        placeholder="Search Marketplace"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent
                            outline-none
                            flex-1
                            dark:text-white"
                    />
                </div>

                {/* MENU */}
                <div className="mt-6 flex flex-col gap-2">

                    <SidebarItem
                        icon={<Store size={22} />}
                        text="Browse all"
                    />

                    <SidebarItem
                        icon={<ShoppingBag size={22} />}
                        text="Buying"
                    />

                    <SidebarItem
                        icon={<Tags size={22} />}
                        text="Selling"
                    />

                </div>

                {/* BUTTON */}
                <button onClick={() => navigate("/market/create")}
                    className="w-full
          mt-6
          bg-blue-500
          hover:bg-blue-600
          transition
          text-white
          py-3
          rounded-xl
          font-semibold
          flex
          items-center
          justify-center
          cursor-pointer
          gap-2 "
                >
                    <Plus size={20} />
                    Create new listing

                </button>

            </div>

            {/* PRODUCTS */}
            <div className="flex-1 ml-[360px] p-6">

                <h1 className="text-3xl font-bold mb-6 dark:text-white">
                    Today's picks
                </h1>

                {/* GRID */}
                <div
                    className="grid
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          gap-5"
                >
                    {products.map((product) => (
                        <div
                            key={product._id}
                            onClick={() =>
                                navigate(`/market/${product._id}`)
                            }
                            className="bg-white
              dark:bg-[#242526]
              rounded-2xl
              overflow-hidden
              cursor-pointer
              hover:shadow-2xl
              transition-all
              duration-300"
                        >

                            {/* IMAGE */}
                            <div className="h-[280px] overflow-hidden">
                                <img
                                    src={product.productImage.url}
                                    alt={product.productName}
                                    className="w-full
                  h-full
                  object-cover
                  hover:scale-105
                  transition-all
                  duration-500"
                                />
                            </div>

                            {/* CONTENT */}
                            <div className="p-4">

                                <h2 className="text-2xl font-bold dark:text-white">
                                    ₹{product.price}
                                </h2>

                                <p className="text-lg mt-1 dark:text-gray-300">
                                    {product.productName}
                                </p>

                                <p className="text-sm text-gray-500 mt-1">
                                    {product.location}
                                </p>

                                {/* SELLER */}
                                <div className="flex items-center justify-between mt-4">

                                    <div className="flex items-center gap-2">

                                        <img
                                            src={
                                                product?.seller?.profileimage?.url ||
                                                "/default.png"
                                            }
                                            className="w-8 h-8 rounded-full"
                                        />

                                        <span className="text-sm dark:text-gray-300">
                                            {product?.seller?.firstname}{" "}
                                            {product?.seller?.lastname}
                                        </span>

                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(product._id);
                                        }}
                                        className="text-red-500 text-sm font-semibold hover:text-red-600 cursor-pointer height-10 width-10"
                                    >
                                        <FaRegTrashAlt />
                                    </button>

                                </div>

                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

const SidebarItem = ({ icon, text }) => {
    return (
        <div
            className="flex
      items-center
      gap-3
      p-3
      rounded-xl
      hover:bg-[#f0f2f5]
      dark:hover:bg-[#3a3b3c]
      cursor-pointer
      transition"
        >
            <div className="dark:text-white">
                {icon}
            </div>

            <span className="font-medium dark:text-white">
                {text}
            </span>
        </div>
    );
};

export default Marketplace;