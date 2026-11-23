import express from "express";
import { recommendCrop } from "../controllers/cropRecommendationController.js";

const router = express.Router();

router.post("/", recommendCrop);

export default router;