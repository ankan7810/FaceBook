import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({
   path:'./.env'
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
export const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    const ext = path.extname(filePath).toLowerCase();

    let resourceType = "raw";

    if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
      resourceType = "image";
    } else if ([".mp4", ".mov", ".mkv"].includes(ext)) {
      resourceType = "video";
    }

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: resourceType
    });

    // delete local file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: resourceType
    };

  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.error("Cloudinary Upload Error:", error.message);
    return null;
  }
};