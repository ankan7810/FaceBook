// import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();

// export const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URL)
//     console.log("Connected to MongoDB");
//   } catch (error) {
//     console.log(error);
//     process.exit(1);
//   }
// };




import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connected ✅: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB Error ❌:", error.message);
    process.exit(1);
  }
};