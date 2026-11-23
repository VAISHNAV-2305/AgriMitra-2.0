import express from "express";
import { getAllEquipments, createEquipment, deleteEquipment, updateEquipment } from "../controllers/equipmentsController.js";
import { uploadMarketplaceImage } from "../middleware/imageUpload.js";

const router = express.Router();

router.get("/", getAllEquipments);

router.post("/create", uploadMarketplaceImage, createEquipment);

router.delete("/:id", deleteEquipment);

router.put("/:id", uploadMarketplaceImage, updateEquipment);


export default router;
