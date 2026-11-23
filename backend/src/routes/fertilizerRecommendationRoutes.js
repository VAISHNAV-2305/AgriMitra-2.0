import express from "express";
import { recommendFertilizer } from "../controllers/fertilizerRecommendationController.js";

const router = express.Router();

router.post("/", recommendFertilizer);

export default router;