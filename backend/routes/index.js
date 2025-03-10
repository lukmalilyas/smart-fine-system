import express from 'express';
import authRoutes from "./authRoutes.js";
import accountRoutes from "./accountRoutes.js";
import transactionRoutes from "./transactionRoutes.js";
import userRoutes from "./userRoutes.js";

const routes = express.Router();

routes.use("/auth", authRoutes);
routes.use("/user", userRoutes);
routes.use("/account", accountRoutes);
routes.use("/transaction", transactionRoutes);

export default routes;