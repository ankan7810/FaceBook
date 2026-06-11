import { uploadOnCloudinary } from "../Middlewares/Cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import { Market } from "../Models/Market.Models.js";

export const createMarketProduct = async (req, res) => {
  try {
    const { productName, description, price, location ,type} = req.body;

    const userId = req.user.id;

    if (!productName || !description || !price || !location || !type) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Product image is required",
      });
    }

    const uploadedImage = await uploadOnCloudinary(req.file.path);

    if (!uploadedImage) {
      return res.status(500).json({
        success: false,
        message: "Image upload failed",
      });
    }

    const product = await Market.create({
      productName,
      description,
      price,
      location,
      type,

      productImage: {
        url: uploadedImage.url,
        public_id: uploadedImage.public_id,
      },

      seller: userId,
    });

    const populatedProduct = await Market.findById(product._id).populate(
      "seller",
      "firstname lastname profileimage liveIn",
    );

    return res.status(201).json({
      success: true,
      message: "Product uploaded successfully",
      product: populatedProduct,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllMarketProducts = async (req, res) => {
  try {
    const products = await Market.find()
      .populate("seller", "firstname lastname profileimage liveIn")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getSingleMarketProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Market.findById(id).populate(
      "seller",
      "firstname lastname profileimage liveIn",
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteMarketProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Market.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // CHECK OWNER
    const sellerId =
      product.seller._id || product.seller;

    if (sellerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // DELETE IMAGE FROM CLOUDINARY
    if (product.productImage?.public_id) {
      await cloudinary.uploader.destroy(
        product.productImage.public_id
      );
    }

    // DELETE PRODUCT
    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMyMarketProducts = async (req, res) => {
  try {
    const userId = req.user.id;

    const products = await Market.find({
      seller: userId,
    })
      .populate("seller", "firstname lastname profileimage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const searchMarketProducts = async (req, res) => {
  try {
    const { query } = req.query;

    // IF SEARCH EMPTY
    if (!query || query.trim() === "") {

      const products = await Market.find()
        .populate(
          "seller",
          "firstname lastname profileimage liveIn"
        )
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        products,
      });
    }

    // SEARCH CONDITIONS
    const searchConditions = [
      {
        productName: {
          $regex: query,
          $options: "i",
        },
      },
      {
        description: {
          $regex: query,
          $options: "i",
        },
      },
    ];

    // PRICE SEARCH
    if (!isNaN(query)) {
      searchConditions.push({
        price: Number(query),
      });
    }

    // FETCH PRODUCTS
    const products = await Market.find({
      $or: searchConditions,
    })
      .populate(
        "seller",
        "firstname lastname profileimage liveIn"
      )
      .sort({ createdAt: -1 });

    // USERNAME SEARCH
    const usernameProducts = await Market.find()
      .populate(
        "seller",
        "firstname lastname profileimage liveIn"
      );

    const filteredUsernameProducts =
      usernameProducts.filter((product) => {

        const fullname =
          `${product?.seller?.firstname || ""} ${product?.seller?.lastname || ""}`;

        return fullname
          .toLowerCase()
          .includes(query.toLowerCase());
      });

    // MERGE PRODUCTS
    const mergedProducts = [
      ...products,
      ...filteredUsernameProducts,
    ];

    // REMOVE DUPLICATES
    const uniqueProducts = mergedProducts.filter(
      (product, index, self) =>
        index ===
        self.findIndex(
          (p) =>
            p._id.toString() ===
            product._id.toString()
        )
    );

    return res.status(200).json({
      success: true,
      products: uniqueProducts,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};