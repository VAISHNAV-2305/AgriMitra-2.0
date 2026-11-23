
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import serveStatic from "serve-static";

import notesRoutes from "./routes/notesRoutes.js";
import cropRoutes from "./routes/cropRoutes.js";
import cropRecommendationRoutes from "./routes/cropRecommendationRoutes.js";
import fertilizerRecommendationRoutes from "./routes/fertilizerRecommendationRoutes.js";
import yieldPredictionRoutes from "./routes/yieldPredictionRoutes.js";
import equipmentRoutes from "./routes/equipmentsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import connectDB from "./config/db.js";  
import corsOptions from "./config/corsOptions.js";
import credentials from "./middleware/credentials.js";
import refreshRoutes from "./routes/refreshRoutes.js";
import verifyJWT from "./middleware/verifyJWT.js";
import { ensureCropImageColumns } from "./models/Crops.js";
import { EquipmentModel } from "./models/Equipment.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();


(async () => {
  try {
    const connection = await connectDB.getConnection();
    console.log("✅ MySQL Database connected successfully");
    connection.release();
    await ensureCropImageColumns();
    await EquipmentModel.ensureImageColumns();

    if (process.env.NODE_ENV !== "production") {
      app.use(cors(corsOptions));
    }

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(credentials);

    // Routes
    app.use("/api/users", userRoutes);
    app.use("/api/refresh", refreshRoutes);
    app.use("/api/notes", notesRoutes);

    app.use(verifyJWT);
    app.use("/api/crops", cropRoutes);
    app.use("/api/crop-recommendation", cropRecommendationRoutes);
    app.use("/api/fertilizer-recommendation", fertilizerRecommendationRoutes);
    app.use("/api/yield-prediction", yieldPredictionRoutes);
    app.use("/api/equipments", equipmentRoutes);

    // Static files (frontend build)
    app.use(
      serveStatic(path.join(__dirname, "../frontend/dist"), {
        index: ["index.html"],
        maxAge: "1d",
        setHeaders: (res, path) => {
          if (path.endsWith(".html")) {
            res.setHeader("Cache-Control", "no-cache");
          }
        },
      })
    );

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error connecting to MySQL Database:", error);
    process.exit(1);
  }
})();
