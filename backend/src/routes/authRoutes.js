import express from 'express';
import { signinUser, signupUser } from '../controllers/authController.js';
import authFirebase from '../middleware/authFirebase.js';

const router = express.Router();

router.post("/sign-up", authFirebase, signupUser)
router.post("/sign-in", authFirebase, signinUser)

export default router;