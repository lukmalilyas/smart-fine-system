import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getFines } from '../controllers/finesController.js';

const router = express.Router();

router.get("/:licensePlate", authMiddleware, getFines);

export default router;