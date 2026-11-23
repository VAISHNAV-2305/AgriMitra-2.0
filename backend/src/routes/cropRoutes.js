import express from "express";
import { getCrops, createCrop, updateCrop, deleteCrop } from "../controllers/cropController.js";
import { uploadMarketplaceImage } from "../middleware/imageUpload.js";

const router = express.Router();

router.get("/", getCrops);

router.post("/create", uploadMarketplaceImage, createCrop);

router.put("/:id", uploadMarketplaceImage, updateCrop);

router.delete("/:id", deleteCrop);

export default router;
