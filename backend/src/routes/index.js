import express from 'express';
import authRoutes from "./authRoutes.js";
import vehicles from "./vehicles.js";
import fines from "./fines.js";

const routes = express.Router();

routes.use("/auth", authRoutes);
routes.use("/vehicles", vehicles);
routes.use("/fines", fines);

export default routes;