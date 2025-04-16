import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getSurveillance } from '../controllers/surveillanceController.js';

const router = express.Router();

router.get("/:licenseNumber", getSurveillance);

export default router;