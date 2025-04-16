import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { registerRestaurant, getRestaurants } from '../controllers/restaurantsController.js';

const router = express.Router();

router.get("/", authMiddleware, getRestaurants);
router.post("/register", authMiddleware, registerRestaurant);

export default router;