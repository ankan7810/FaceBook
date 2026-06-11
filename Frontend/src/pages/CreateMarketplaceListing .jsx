import { useState } from "react";

import {
  ArrowLeft,
  Tag,
  Car,
  Building2,
  Upload,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import axios from "axios";

import toast from "react-hot-toast";

import { BASE_URL } from "@/Utils/Constant.js";

const CreateMarketplaceListing = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [imagePreview, setImagePreview] =
    useState("");

  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    price: "",
    location: "",
    type: "another",
    productImage: null,
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setFormData({
      ...formData,
      productImage: file,
    });

    setImagePreview(URL.createObjectURL(file));
  };

  const handleTypeSelect = (type) => {
  setFormData({
    ...formData,
    type,
  });
};

  // INPUT CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // SUBMIT
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const data = new FormData();

      data.append(
        "productName",
        formData.productName
      );

      data.append(
        "description",
        formData.description
      );
      data.append(
        "type",
        formData.type
      );

      data.append(
        "price",
        formData.price
      );

      data.append(
        "location",
        formData.location
      );

      data.append(
        "productImage",
        formData.productImage
      );

      const res = await axios.post(
        `${BASE_URL}/market/create`,
        data,
        {
          withCredentials: true,
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      toast.success(
        res.data.message ||
          "Product uploaded successfully"
      );

      navigate("/market");

    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Upload failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f0f2f5] dark:bg-[#18191a]">

      {/* LEFT SIDEBAR */}
      <div
        className="w-[360px]
        bg-white
        dark:bg-[#242526]
        border-r
        border-gray-200
        dark:border-gray-700
        p-5"
      >

        {/* TOP */}
        <div className="flex items-center gap-4">

          <button
            onClick={() => navigate(-1)}
            className="w-10
            h-10
            rounded-full
            bg-[#e4e6eb]
            dark:bg-[#3a3b3c]
            flex
            items-center
            justify-center"
          >
            <ArrowLeft />
          </button>

          <h1 className="text-4xl font-bold dark:text-white">
            Marketplace
          </h1>

        </div>

        {/* TITLE */}
        <h2 className="text-3xl font-bold mt-10 dark:text-white">
          Create new listing
        </h2>

        {/* MENU */}
        <div className="mt-8 flex flex-col gap-3">

          <SidebarItem
            icon={<Tag />}
            text="Item for sale"
            active
          />

          <SidebarItem
            icon={<Car />}
            text="Vehicle for sale"
          />

          <SidebarItem
            icon={<Building2 />}
            text="Property for sale or rent"
          />

        </div>

      </div>

      {/* RIGHT */}
      <div className="flex-1 flex justify-center p-10">

        <div
          className="w-full
          max-w-3xl
          bg-white
          dark:bg-[#242526]
          rounded-2xl
          shadow-sm
          p-8"
        >

          <h1 className="text-4xl font-bold dark:text-white">
            Item for sale
          </h1>

          {/* IMAGE */}
          <div className="mt-8">

            <label
              className="h-[320px]
              border-2
              border-dashed
              border-gray-300
              rounded-2xl
              flex
              flex-col
              items-center
              justify-center
              cursor-pointer
              overflow-hidden"
            >

              {imagePreview ? (
                <img
                  src={imagePreview}
                  className="w-full
                  h-full
                  object-cover"
                />
              ) : (
                <>
                  <Upload size={50} />

                  <p className="mt-4 text-lg font-medium">
                    Upload photos
                  </p>
                </>
              )}

              <input
                type="file"
                hidden
                onChange={handleImageChange}
              />
            </label>

          </div>

          {/* INPUTS */}
          <div className="mt-8 space-y-5">

            <input
              type="text"
              name="productName"
              placeholder="Product title"
              value={formData.productName}
              onChange={handleChange}
              className="w-full
              p-4
              rounded-xl
              bg-[#f0f2f5]
              dark:bg-[#3a3b3c]
              outline-none
              dark:text-white"
            />

            <textarea
              rows={5}
              name="description"
              placeholder="Describe your item..."
              value={formData.description}
              onChange={handleChange}
              className="w-full
              p-4
              rounded-xl
              bg-[#f0f2f5]
              dark:bg-[#3a3b3c]
              outline-none
              dark:text-white"
            />

            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              className="w-full
              p-4
              rounded-xl
              bg-[#f0f2f5]
              dark:bg-[#3a3b3c]
              outline-none
              dark:text-white"
            />

            {/* CATEGORY */}
<div>
  <p className="text-lg font-semibold mb-3 dark:text-white">
    Type
  </p>

  <div className="grid grid-cols-3 gap-4">

    <button
      type="button"
      onClick={() => handleTypeSelect("vehicle")}
      className={`p-4 rounded-xl border flex items-center justify-center gap-3 font-semibold transition
      ${
        formData.type === "vehicle"
          ? "border-blue-500 bg-blue-50 dark:bg-blue-500/20"
          : "border-gray-300 dark:border-gray-600"
      }`}
    >
      <Car size={22} />
      Vehicle
    </button>

    <button
      type="button"
      onClick={() => handleTypeSelect("property")}
      className={`p-4 rounded-xl border flex items-center justify-center gap-3 font-semibold transition
      ${
        formData.type === "property"
          ? "border-blue-500 bg-blue-50 dark:bg-blue-500/20"
          : "border-gray-300 dark:border-gray-600"
      }`}
    >
      <Building2 size={22} />
      Property
    </button>

    <button
      type="button"
      onClick={() => handleTypeSelect("another")}
      className={`p-4 rounded-xl border flex items-center justify-center gap-3 font-semibold transition
      ${
        formData.type === "another"
          ? "border-blue-500 bg-blue-50 dark:bg-blue-500/20"
          : "border-gray-300 dark:border-gray-600"
      }`}
    >
      <Tag size={22} />
      Another
    </button>

  </div>
</div>
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              className="w-full
              p-4
              rounded-xl
              bg-[#f0f2f5]
              dark:bg-[#3a3b3c]
              outline-none
              dark:text-white"
            />

          </div>

          {/* BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full
            mt-8
            bg-blue-500
            hover:bg-blue-600
            transition
            text-white
            py-4
            rounded-xl
            font-bold
            cursor-pointer
            text-lg "
          >
            {loading
              ? "Uploading..."
              : "Create Listing"}
          </button>

        </div>
      </div>
    </div>
  );
};

const SidebarItem = ({
  icon,
  text,
  active,
}) => {
  return (
    <div
      className={`flex
      items-center
      gap-4
      p-4
      rounded-xl
      cursor-pointer
      transition
      ${
        active
          ? "bg-blue-100 dark:bg-blue-500/20"
          : "hover:bg-[#f0f2f5] dark:hover:bg-[#3a3b3c]"
      }`}
    >

      <div
        className={`w-10
        h-10
        rounded-full
        flex
        items-center
        justify-center
        ${
          active
            ? "bg-blue-500 text-white"
            : "bg-[#e4e6eb] dark:bg-[#3a3b3c]"
        }`}
      >
        {icon}
      </div>

      <span className="font-semibold dark:text-white">
        {text}
      </span>

    </div>
  );
};

export default CreateMarketplaceListing;