import express from "express";
import { predictYield } from "../controllers/yieldPredictionController.js";

const router = express.Router();

router.post("/", predictYield);

export default router;