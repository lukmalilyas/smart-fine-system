import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { registerVehicle, getVehicles } from '../controllers/vehiclesController.js';

const router = express.Router();

router.get("/", authMiddleware, getVehicles);
router.post("/register", authMiddleware, registerVehicle);

export default router;