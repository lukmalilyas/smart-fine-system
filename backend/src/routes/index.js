import express from 'express';
import authRoutes from "./authRoutes.js";
import vehicle from "./vehicle.js";
import fines from "./fines.js";

const routes = express.Router();

routes.use("/auth", authRoutes);
routes.use("/vehicle", vehicle);
routes.use("/fines", fines);

export default routes;