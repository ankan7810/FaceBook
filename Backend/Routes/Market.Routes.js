import express from "express";

import isAuth from "../Middlewares/isAuth.js";

import { upload } from "../Middlewares/Multer.js";
import { createMarketProduct, deleteMarketProduct, getAllMarketProducts, getMyMarketProducts, getSingleMarketProduct, searchMarketProducts } from "../Controllers/Market.Controller.js";

const marketrouter = express.Router();

marketrouter.post("/create",isAuth,upload.single("productImage"),createMarketProduct,);
marketrouter.get("/all", getAllMarketProducts);
marketrouter.get("/search", searchMarketProducts);
marketrouter.get("/my-products", isAuth, getMyMarketProducts);
marketrouter.get("/:id", getSingleMarketProduct);
marketrouter.delete("/delete/:id", isAuth, deleteMarketProduct);

export default marketrouter;
